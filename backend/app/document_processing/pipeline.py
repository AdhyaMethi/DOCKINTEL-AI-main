import os
from datetime import datetime, timezone
from backend.app.extensions import db
from backend.app.models.document import Document
from backend.app.models.page import DocumentPage
from backend.app.models.chunk import DocumentChunk
from backend.app.models.entity import DocumentEntity
from backend.app.models.summary import DocumentSummary
from backend.app.models.keyword import DocumentKeyword
from backend.app.models.job import ProcessingJob
from backend.app.document_processing.pdf_service import PDFExtractor
from backend.app.document_processing.docx_service import DocxExtractor
from backend.app.document_processing.text_service import TextExtractor
from backend.app.document_processing.ocr_service import OCRExtractor
from backend.app.document_processing.text_cleaner import clean_text, calculate_text_stats
from backend.app.document_processing.classifier_service import DocumentClassifier
from backend.app.document_processing.metadata_extractor import MetadataExtractor
from backend.app.document_processing.entity_extractor import EntityExtractor
from backend.app.document_processing.chunking_service import TextChunker
from backend.app.ai.embedding_service import EmbeddingService
from backend.app.ai.summarization_service import SummarizationService
from backend.app.ai.keyword_service import KeywordService


class DocumentProcessingPipeline:
    """Master asynchronous-compatible pipeline orchestrating document ingestion and intelligence extraction."""

    @classmethod
    def process_document(cls, document_id: str, app=None) -> bool:
        """Runs the full intelligence pipeline on a document."""
        if app:
            with app.app_context():
                return cls._execute_pipeline(document_id)
        else:
            return cls._execute_pipeline(document_id)

    @classmethod
    def _execute_pipeline(cls, document_id: str) -> bool:
        doc = Document.query.get(document_id)
        if not doc:
            return False

        # Create or update processing job
        job = ProcessingJob.query.filter_by(document_id=document_id, status="pending").first()
        if not job:
            job = ProcessingJob(document_id=document_id, status="running", current_step="Initializing", progress_percentage=5)
            db.session.add(job)
        else:
            job.status = "running"
            job.current_step = "Initializing"
            job.progress_percentage = 5
        
        doc.status = "processing"
        doc.error_message = None
        db.session.commit()

        try:
            file_path = doc.file_path
            ext = doc.file_extension.lower()

            # ----------------------------------------------------
            # Step 1: Text Extraction & OCR
            # ----------------------------------------------------
            job.current_step = "Extracting text"
            job.progress_percentage = 15
            db.session.commit()

            raw_text = ""
            pages_data = []
            ocr_applied = False

            if ext == "pdf":
                pdf_res = PDFExtractor.extract(file_path)
                raw_text = pdf_res["full_text"]
                pages_data = pdf_res["pages"]
                
                # If extracted text is sparse (< 50 chars per page on average), attempt OCR
                if len(raw_text.strip()) < 50 and OCRExtractor.is_ocr_available():
                    try:
                        job.current_step = "Performing OCR on scanned PDF"
                        db.session.commit()
                        ocr_res = OCRExtractor.extract_image(file_path)
                        if len(ocr_res["full_text"]) > len(raw_text):
                            raw_text = ocr_res["full_text"]
                            pages_data = ocr_res["pages"]
                            ocr_applied = True
                    except Exception:
                        pass

            elif ext in ["docx", "doc"]:
                docx_res = DocxExtractor.extract(file_path)
                raw_text = docx_res["full_text"]
                pages_data = docx_res["pages"]

            elif ext == "txt":
                txt_res = TextExtractor.extract(file_path)
                raw_text = txt_res["full_text"]
                pages_data = txt_res["pages"]

            elif ext in ["jpg", "jpeg", "png"]:
                job.current_step = "Performing OCR on image"
                db.session.commit()
                img_res = OCRExtractor.extract_image(file_path)
                raw_text = img_res["full_text"]
                pages_data = img_res["pages"]
                ocr_applied = img_res.get("ocr_applied", False)

            else:
                # Generic fallback
                txt_res = TextExtractor.extract(file_path)
                raw_text = txt_res["full_text"]
                pages_data = txt_res["pages"]

            # ----------------------------------------------------
            # Step 2: Cleaning & Statistics
            # ----------------------------------------------------
            job.current_step = "Cleaning and normalizing text"
            job.progress_percentage = 30
            db.session.commit()

            cleaned = clean_text(raw_text)
            stats = calculate_text_stats(cleaned)

            doc.raw_text = raw_text
            doc.cleaned_text = cleaned
            doc.page_count = max(len(pages_data), 1)
            doc.total_characters = stats["char_count"]
            doc.total_words = stats["word_count"]
            doc.ocr_applied = ocr_applied

            # Save pages
            DocumentPage.query.filter_by(document_id=doc.id).delete()
            for p in pages_data:
                p_text = clean_text(p.get("text", ""))
                page_rec = DocumentPage(
                    document_id=doc.id,
                    page_number=p.get("page_number", 1),
                    text_content=p_text,
                    char_count=len(p_text),
                )
                db.session.add(page_rec)

            # ----------------------------------------------------
            # Step 3: Classification
            # ----------------------------------------------------
            job.current_step = "Classifying document type"
            job.progress_percentage = 45
            db.session.commit()

            doc_type, confidence = DocumentClassifier.classify(cleaned, doc.original_filename)
            doc.document_type = doc_type
            doc.classification_confidence = confidence

            # ----------------------------------------------------
            # Step 4: Metadata & Entity Extraction
            # ----------------------------------------------------
            job.current_step = "Extracting entities and metadata"
            job.progress_percentage = 60
            db.session.commit()

            metadata = MetadataExtractor.extract_metadata(cleaned, doc_type, doc.original_filename)
            metadata["stats"] = stats
            doc.set_metadata(metadata)

            # Extract NER entities
            DocumentEntity.query.filter_by(document_id=doc.id).delete()
            entities = EntityExtractor.extract_entities(cleaned)
            for ent in entities:
                ent_rec = DocumentEntity(
                    document_id=doc.id,
                    entity_type=ent["entity_type"],
                    entity_value=ent["entity_value"],
                    count=ent["count"],
                    confidence=ent["confidence"],
                )
                db.session.add(ent_rec)

            # ----------------------------------------------------
            # Step 5: Chunking & Vector Embeddings
            # ----------------------------------------------------
            job.current_step = "Chunking and generating vector embeddings"
            job.progress_percentage = 75
            db.session.commit()

            chunker = TextChunker()
            chunks = chunker.chunk_pages(pages_data)

            DocumentChunk.query.filter_by(document_id=doc.id).delete()
            for ch in chunks:
                ch_text = ch["text_content"]
                vec = EmbeddingService.generate_embedding(ch_text)
                chunk_rec = DocumentChunk(
                    document_id=doc.id,
                    page_number=ch["page_number"],
                    chunk_index=ch["chunk_index"],
                    text_content=ch_text,
                    token_count=ch["token_count"],
                )
                chunk_rec.set_embedding(vec)
                db.session.add(chunk_rec)

            # ----------------------------------------------------
            # Step 6: Summarization & Keywords
            # ----------------------------------------------------
            job.current_step = "Generating summary and keywords"
            job.progress_percentage = 90
            db.session.commit()

            summary_res = SummarizationService.summarize(cleaned, doc_type)
            DocumentSummary.query.filter_by(document_id=doc.id).delete()
            summary_rec = DocumentSummary(
                document_id=doc.id,
                short_summary=summary_res["short_summary"],
                detailed_summary=summary_res["detailed_summary"],
                provider=summary_res.get("provider", "extractive_textrank"),
            )
            summary_rec.set_key_points(summary_res["key_points"])
            db.session.add(summary_rec)

            # Extract Keywords
            DocumentKeyword.query.filter_by(document_id=doc.id).delete()
            keywords = KeywordService.extract_keywords(cleaned, top_n=20)
            for kw in keywords:
                kw_rec = DocumentKeyword(
                    document_id=doc.id,
                    keyword=kw["keyword"],
                    frequency=kw["frequency"],
                    score=kw["score"],
                )
                db.session.add(kw_rec)

            # ----------------------------------------------------
            # Complete
            # ----------------------------------------------------
            doc.status = "completed"
            job.status = "completed"
            job.current_step = "Processing completed successfully"
            job.progress_percentage = 100
            job.completed_at = datetime.now(timezone.utc)
            db.session.commit()
            return True

        except Exception as e:
            db.session.rollback()
            doc = Document.query.get(document_id)
            if doc:
                doc.status = "failed"
                doc.error_message = str(e)
            job = ProcessingJob.query.filter_by(document_id=document_id).order_by(ProcessingJob.started_at.desc()).first()
            if job:
                job.status = "failed"
                job.current_step = "Failed"
                job.error_message = str(e)
                job.completed_at = datetime.now(timezone.utc)
            db.session.commit()
            return False

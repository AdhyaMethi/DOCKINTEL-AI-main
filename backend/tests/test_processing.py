from backend.app.document_processing.text_cleaner import clean_text, calculate_text_stats
from backend.app.document_processing.classifier_service import DocumentClassifier
from backend.app.document_processing.entity_extractor import EntityExtractor
from backend.app.document_processing.metadata_extractor import MetadataExtractor
from backend.app.document_processing.chunking_service import TextChunker
from backend.app.ai.summarization_service import SummarizationService
from backend.app.ai.keyword_service import KeywordService


def test_text_cleaning():
    raw = "Hello   world!\r\nThis is a test--\nline with unicode \u201cquotes\u201d."
    cleaned = clean_text(raw)
    assert "Hello world!" in cleaned
    assert "quotes" in cleaned


def test_document_classification():
    invoice_text = "INVOICE #9482. Bill To: ACME Corp. Subtotal: $5,000.00. Tax: $500. Total Amount Due: $5,500.00"
    doc_type, conf = DocumentClassifier.classify(invoice_text, "acme_invoice.pdf")
    assert doc_type == "Invoice"
    assert conf >= 0.70

    resume_text = "Curriculum Vitae of John Doe. Experience: Senior Python Software Engineer at Google. Education: B.S. Computer Science."
    r_type, r_conf = DocumentClassifier.classify(resume_text, "john_doe_resume.pdf")
    assert r_type == "Resume"
    assert r_conf >= 0.70


def test_entity_extraction():
    text = "Contact Priyanshu Sahu at priyanshu@docintel.io or call +1 (555) 234-5678. Located in San Francisco, working at OpenAI using Python and React with budget $50,000 on Jan 15, 2026."
    entities = EntityExtractor.extract_entities(text)
    types = {e["entity_type"] for e in entities}
    assert "EMAIL" in types
    assert "PHONE" in types
    assert "MONEY" in types
    assert "TECHNOLOGY" in types


def test_chunking_and_summarization():
    long_text = "Artificial intelligence is transforming document handling. " * 30
    chunker = TextChunker(target_chunk_size=50, overlap_size=10)
    chunks = chunker.chunk_pages([{"page_number": 1, "text": long_text}])
    assert len(chunks) >= 2

    summary = SummarizationService.summarize(long_text)
    assert len(summary["short_summary"]) > 0
    assert len(summary["key_points"]) > 0

import os
import uuid
from datetime import datetime, timezone
from backend.app.extensions import db
from backend.app.models.user import User
from backend.app.models.document import Document
from backend.app.models.page import DocumentPage
from backend.app.models.chunk import DocumentChunk
from backend.app.models.entity import DocumentEntity
from backend.app.models.summary import DocumentSummary
from backend.app.models.keyword import DocumentKeyword
from backend.app.models.chat import ChatSession, ChatMessage
from backend.app.models.audit import AuditLog
from backend.app.models.job import ProcessingJob
from backend.app.ai.embedding_service import EmbeddingService
from backend.app.document_processing.text_cleaner import calculate_text_stats
from backend.app.document_processing.chunking_service import TextChunker
from backend.app.document_processing.classifier_service import DocumentClassifier
from backend.app.document_processing.metadata_extractor import MetadataExtractor
from backend.app.document_processing.entity_extractor import EntityExtractor
from backend.app.ai.summarization_service import SummarizationService
from backend.app.ai.keyword_service import KeywordService


SAMPLE_DOCS = [
    {
        "title": "Deep Residual Learning for Image Recognition in Autonomous Systems",
        "filename": "deep_residual_learning_autonomous.pdf",
        "ext": "pdf",
        "type": "Research Paper",
        "text": """Abstract
Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth.

1. Introduction
Deep convolutional neural networks have led to a series of breakthroughs for image classification. Deep networks naturally integrate low/mid/high-level features and classifiers in an end-to-end multi-layer fashion, and the levels of features can be enriched by the number of stacked layers (depth). Recent evidence reveals that network depth is of crucial importance. When deeper networks are able to start converging, a degradation problem has been exposed: with network depth increasing, accuracy gets saturated and then degrades rapidly.

2. Related Work and Methodology
Residual Representations: In image recognition, VLAD is a representation that encodes by residual vectors with respect to a dictionary, and Fisher Vector can be formulated as a probabilistic version of VLAD. Both are powerful shallow representations for image retrieval and classification.
Shortcut Connections: Practices and theories that lead to shortcut connections have been studied for a long time. An early practice of training multi-layer perceptrons (MLPs) is to add a linear layer connected from the network input to the output.

3. Experiments and Results
We evaluate our method on the ImageNet 2012 classification dataset that consists of 1000 classes. The models are trained on the 1.28 million training images, and evaluated on the 50k validation images. Our 152-layer ResNet achieves a top-5 error rate of 3.57% on ImageNet test set. This result won 1st place in the ILSVRC 2015 classification competition. On autonomous driving perception benchmarks, residual features improved object detection mAP by 8.4 points.

4. Discussion and Conclusion
In this work, we proposed residual connections for deep network architectures. We demonstrated that deep residual nets are easy to optimize and gain significant accuracy from increased depth. The framework enables scaling neural architectures beyond 1000 layers while maintaining computational efficiency."""
    },
    {
        "title": "Priyanshu Sahu - Lead Full-Stack & AI Engineer Resume",
        "filename": "priyanshu_sahu_resume.pdf",
        "ext": "pdf",
        "type": "Resume",
        "text": """Priyanshu Sahu
Email: priyanshu.sahu@docintel.io | Phone: +1 (555) 382-9481 | Location: San Francisco, CA
LinkedIn: linkedin.com/in/priyanshusahu | GitHub: github.com/priyanshu-sahu

Professional Summary
Senior Full-Stack & AI Systems Architect with 7+ years of experience designing scalable microservices, vector search pipelines, RAG architectures, and responsive SaaS frontends. Proven track record in deploying LLM document intelligence platforms, modern React applications, and high-throughput Python Flask backends.

Technical Skills
- Languages: Python, JavaScript, TypeScript, SQL, HTML5, CSS3, Go
- Frontend: React, Redux, TailwindCSS, Vite, Next.js, WebSockets, Lucide Icons, Recharts
- Backend: Flask, FastAPI, Django, Node.js, Express, SQLAlchemy, Celery, Redis
- AI/NLP: PyTorch, Transformers, spaCy, LangChain, SentenceTransformers, Vector Embeddings, RAG, OpenAI API
- Databases & Vector DBs: PostgreSQL, pgvector, Chroma, Redis, SQLite
- Cloud & DevOps: Docker, Kubernetes, AWS, GCP, GitHub Actions, CI/CD, Linux

Professional Experience
Lead AI Platform Architect | CloudScale Intelligence Inc. (2023 - Present)
- Architected enterprise Document Intelligence Platform handling 500,000+ unstructured PDFs, DOCX, and invoices daily.
- Implemented hybrid RAG search combining BM25 lexical search and dense cosine embeddings, improving retrieval precision by 42%.
- Built high-performance async processing pipeline using Python, Redis, and PyMuPDF reducing document ingestion latency from 8s to 1.2s.

Senior Full-Stack Engineer | DataVerse Systems (2020 - 2023)
- Built collaborative web workspaces with React, TypeScript, and Flask REST APIs.
- Designed RBAC authentication layer and comprehensive audit log pipelines for SOC2 compliance.

Education
Bachelor of Science in Computer Science & Artificial Intelligence
Stanford University (Graduated Magna Cum Laude)"""
    },
    {
        "title": "Invoice #INV-2026-9482 - Cloud Infrastructure and AI Computing Services",
        "filename": "invoice_cloud_services_9482.pdf",
        "ext": "pdf",
        "type": "Invoice",
        "text": """INVOICE
DocIntel Cloud Services LLC
100 Silicon Way, Suite 400, San Francisco, CA 94107
Tax ID: US-948201948 | Email: billing@docintel.io

Bill To:
Apex Global Technologies Inc.
Attn: Accounts Payable
450 Market Street, Floor 12, San Francisco, CA 94105

Invoice Details:
Invoice Number: INV-2026-9482
Invoice Date: August 15, 2026
Payment Due Date: September 14, 2026
Payment Terms: Net 30

Itemized Services:
1. Enterprise Document Intelligence API Cluster (8x NVIDIA H100 GPUs) - Qty: 1 - Unit Price: $8,400.00 - Total: $8,400.00
2. Vector Database Managed Hosting (pgvector cluster, 50M embeddings) - Qty: 1 - Unit Price: $1,850.00 - Total: $1,850.00
3. High-Speed OCR Document Processing Tier (1,000,000 pages) - Qty: 1 - Unit Price: $1,200.00 - Total: $1,200.00
4. 24/7 Dedicated Enterprise Support & SLA - Qty: 1 - Unit Price: $750.00 - Total: $750.00

Financial Summary:
Subtotal: $12,200.00
State & Local Sales Tax (8.5%): $1,037.00
Total Amount Due: $13,237.00

Payment Remittance:
Bank: Silicon Valley Bank
Account Name: DocIntel Cloud Services LLC
Routing: 121000358 | Account: 849204829104
Thank you for your business!"""
    },
    {
        "title": "Master Software Services and Data Processing Agreement",
        "filename": "master_software_agreement.pdf",
        "ext": "pdf",
        "type": "Contract",
        "text": """MASTER SERVICES AGREEMENT
This Master Services Agreement ("Agreement") is made and entered into as of January 10, 2026 ("Effective Date"), by and between:
DocIntel Systems Inc., a Delaware corporation ("Provider"), and
Apex Global Technologies Inc., a California corporation ("Client").

WHEREAS, Provider offers an intelligent document intelligence platform, vector search engine, and automated NLP analytics; and
WHEREAS, Client desires to retain Provider for enterprise software services.

1. Scope of Services & License Grant
Provider hereby grants Client a non-exclusive, non-transferable, worldwide subscription license to access and use the Intelligent Document Platform in accordance with the Documentation.

2. Fees, Invoicing and Payment Terms
Client shall pay all fees specified in applicable Order Forms. Invoices are issued monthly in advance and are due within thirty (30) days from invoice date (Net 30). Late payments accrue interest at 1.5% per month.

3. Confidentiality & Data Security
Each party agrees to safeguard the Confidential Information of the other party. Provider implements industry-standard AES-256 encryption at rest and TLS 1.3 encryption in transit for all client documents. Provider shall not use Client data for model training without express written consent.

4. Term and Termination
This Agreement commences on the Effective Date and continues for an initial term of three (3) years. Either party may terminate upon thirty (30) days written notice for material breach if unremedied within such period.

5. Governing Law and Dispute Resolution
This Agreement shall be governed by and construed in accordance with the laws of the State of California, without regard to conflicts of law principles.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the Effective Date."""
    }
]


def seed_database():
    """Populates database with default admin, demo user, and rich processed sample documents."""
    admin_email = os.getenv("SEED_ADMIN_EMAIL", "admin@docintel.io")
    admin_pass = os.getenv("SEED_ADMIN_PASSWORD", "AdminPassword123!")
    admin_user = os.getenv("SEED_ADMIN_USERNAME", "AdminUser")

    demo_email = os.getenv("SEED_DEMO_EMAIL", "demo@docintel.io")
    demo_pass = os.getenv("SEED_DEMO_PASSWORD", "DemoPassword123!")
    demo_user = os.getenv("SEED_DEMO_USERNAME", "DemoUser")

    # 1. Admin User
    admin = User.query.filter_by(email=admin_email).first()
    if not admin:
        admin = User(email=admin_email, username=admin_user, role="admin", is_active=True)
        admin.set_password(admin_pass)
        db.session.add(admin)
        db.session.commit()
        print(f"[*] Seeded Admin user: {admin_email}")

    # 2. Demo User
    demo = User.query.filter_by(email=demo_email).first()
    if not demo:
        demo = User(email=demo_email, username=demo_user, role="user", is_active=True)
        demo.set_password(demo_pass)
        db.session.add(demo)
        db.session.commit()
        print(f"[*] Seeded Demo user: {demo_email}")

    # 3. Seed Sample Documents for Demo User
    storage_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage/uploads", str(demo.id))
    os.makedirs(storage_dir, exist_ok=True)

    for item in SAMPLE_DOCS:
        existing_doc = Document.query.filter_by(user_id=demo.id, title=item["title"]).first()
        if existing_doc:
            continue

        doc_id = str(uuid.uuid4())
        stored_fname = f"{doc_id}_{item['filename']}"
        file_path = os.path.join(storage_dir, stored_fname)

        # Write text representation to storage
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(item["text"])

        file_size = len(item["text"].encode("utf-8"))
        stats = calculate_text_stats(item["text"])
        doc_type, conf = DocumentClassifier.classify(item["text"], item["filename"])

        doc = Document(
            id=doc_id,
            user_id=demo.id,
            title=item["title"],
            original_filename=item["filename"],
            stored_filename=stored_fname,
            file_path=file_path,
            file_size=file_size,
            mime_type="application/pdf",
            file_extension=item["ext"],
            status="completed",
            document_type=item.get("type", doc_type),
            classification_confidence=conf or 0.95,
            page_count=2,
            total_characters=stats["char_count"],
            total_words=stats["word_count"],
            raw_text=item["text"],
            cleaned_text=item["text"],
        )

        # Metadata
        meta = MetadataExtractor.extract_metadata(item["text"], doc.document_type, item["filename"])
        meta["stats"] = stats
        doc.set_metadata(meta)
        db.session.add(doc)

        # Pages
        p1 = DocumentPage(document_id=doc.id, page_number=1, text_content=item["text"][:len(item["text"]) // 2], char_count=len(item["text"]) // 2)
        p2 = DocumentPage(document_id=doc.id, page_number=2, text_content=item["text"][len(item["text"]) // 2:], char_count=len(item["text"]) - len(item["text"]) // 2)
        db.session.add(p1)
        db.session.add(p2)

        # Chunks & Embeddings
        chunker = TextChunker(target_chunk_size=180, overlap_size=20)
        chunks = chunker.chunk_pages([{"page_number": 1, "text": p1.text_content}, {"page_number": 2, "text": p2.text_content}])
        for ch in chunks:
            c_rec = DocumentChunk(
                document_id=doc.id,
                page_number=ch["page_number"],
                chunk_index=ch["chunk_index"],
                text_content=ch["text_content"],
                token_count=ch["token_count"],
            )
            vec = EmbeddingService.generate_embedding(ch["text_content"])
            c_rec.set_embedding(vec)
            db.session.add(c_rec)

        # Entities
        entities = EntityExtractor.extract_entities(item["text"])
        for ent in entities:
            e_rec = DocumentEntity(
                document_id=doc.id,
                entity_type=ent["entity_type"],
                entity_value=ent["entity_value"],
                count=ent["count"],
                confidence=ent["confidence"],
            )
            db.session.add(e_rec)

        # Summary
        summary_res = SummarizationService.summarize(item["text"], doc.document_type)
        summary_rec = DocumentSummary(
            document_id=doc.id,
            short_summary=summary_res["short_summary"],
            detailed_summary=summary_res["detailed_summary"],
            provider="extractive_textrank",
        )
        summary_rec.set_key_points(summary_res["key_points"])
        db.session.add(summary_rec)

        # Keywords
        keywords = KeywordService.extract_keywords(item["text"], top_n=12)
        for kw in keywords:
            k_rec = DocumentKeyword(
                document_id=doc.id,
                keyword=kw["keyword"],
                frequency=kw["frequency"],
                score=kw["score"],
            )
            db.session.add(k_rec)

        # Job
        job = ProcessingJob(
            document_id=doc.id,
            status="completed",
            current_step="Processing completed",
            progress_percentage=100,
            completed_at=datetime.now(timezone.utc),
        )
        db.session.add(job)

        print(f"[*] Seeded Document: {item['title']} ({doc.document_type})")

    # Seed an initial Chat Session
    research_doc = Document.query.filter_by(user_id=demo.id, document_type="Research Paper").first()
    if research_doc and not ChatSession.query.filter_by(user_id=demo.id).first():
        chat = ChatSession(user_id=demo.id, title=f"Chat with {research_doc.title}", document_id=research_doc.id)
        db.session.add(chat)
        db.session.commit()

        msg_u = ChatMessage(session_id=chat.id, role="user", content="What was the top-5 error rate achieved by the ResNet architecture?")
        msg_a = ChatMessage(session_id=chat.id, role="assistant", content="According to the research paper (Page 2), the 152-layer ResNet achieves a top-5 error rate of 3.57% on the ImageNet test set, winning 1st place in the ILSVRC 2015 classification competition.")
        msg_a.set_sources([{
            "document_id": research_doc.id,
            "document_title": research_doc.title,
            "page_number": 2,
            "excerpt": "Our 152-layer ResNet achieves a top-5 error rate of 3.57% on ImageNet test set. This result won 1st place in the ILSVRC 2015 classification competition.",
            "score": 0.94,
        }])
        db.session.add(msg_u)
        db.session.add(msg_a)

    # Seed sample audit logs
    audit_init = AuditLog(user_id=admin.id, action="LOGIN", resource_type="USER", resource_id=admin.id)
    audit_init.set_details({"message": "Platform initialized with seed data"})
    db.session.add(audit_init)

    db.session.commit()
    print("[+] Seed completed successfully!")

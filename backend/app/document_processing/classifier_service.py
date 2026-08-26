import re
from typing import Dict, Any, Tuple


class DocumentClassifier:
    """Classifies document content into predefined categories with confidence scores."""

    CATEGORIES = {
        "Resume": {
            "keywords": [
                "curriculum vitae", "resume", "experience", "education", "skills",
                "employment", "work history", "projects", "certifications", "bachelor",
                "master", "phd", "university", "college", "linkedin", "github",
                "technical skills", "professional summary", "qualifications", "references"
            ],
            "regex": [r"\b(c\.?v\.?|resume)\b", r"\b(b\.?s\.?|m\.?s\.?|ph\.?d\.?)\b", r"\bexperience\b", r"\beducation\b"],
            "weight": 1.2
        },
        "Invoice": {
            "keywords": [
                "invoice", "bill to", "ship to", "invoice number", "invoice date",
                "due date", "subtotal", "tax", "vat", "gst", "total amount", "amount due",
                "payment terms", "unit price", "quantity", "qty", "remittance", "item description"
            ],
            "regex": [r"\binvoice\s*#?\s*\w+\b", r"\btotal\s*:\s*[\$\€\£\₹]?\s*[\d,.]+", r"\bbill\s+to\b"],
            "weight": 1.3
        },
        "Research Paper": {
            "keywords": [
                "abstract", "introduction", "methodology", "methods", "results",
                "discussion", "conclusion", "references", "bibliography", "doi",
                "et al", "experiment", "hypothesis", "literature review", "findings",
                "dataset", "evaluation metrics", "proceedings", "journal"
            ],
            "regex": [r"\babstract\b", r"\bmethodology\b", r"\breferences\b", r"\bet\s+al\.?\b", r"\bdoi\b"],
            "weight": 1.2
        },
        "Contract": {
            "keywords": [
                "agreement", "contract", "parties", "hereby", "whereas", "terms and conditions",
                "effective date", "termination", "confidentiality", "indemnification",
                "governing law", "jurisdiction", "in witness whereof", "signatures", "clause",
                "obligations", "breach", "intellectual property", "non-disclosure"
            ],
            "regex": [r"\bthis\s+agreement\b", r"\bwhereas\b", r"\bhereby\b", r"\bin\s+witness\s+whereof\b"],
            "weight": 1.3
        },
        "Certificate": {
            "keywords": [
                "certificate", "certifies that", "awarded to", "has completed",
                "achievement", "recognition", "completion", "honors", "presented to",
                "in witness", "authorized signature", "date of issue", "serial number"
            ],
            "regex": [r"\bcertifi(cate|es|ed)\b", r"\b(awarded|presented)\s+to\b", r"\bhas\s+successfully\s+completed\b"],
            "weight": 1.3
        },
        "Report": {
            "keywords": [
                "annual report", "quarterly report", "financial report", "status report",
                "executive summary", "key findings", "recommendations", "overview",
                "market analysis", "performance", "metrics", "kpi", "milestones", "progress"
            ],
            "regex": [r"\b(executive\s+summary|annual\s+report|status\s+report)\b", r"\brecommendations\b"],
            "weight": 1.1
        },
        "Manual": {
            "keywords": [
                "user manual", "user guide", "instruction manual", "installation",
                "troubleshooting", "maintenance", "getting started", "step 1", "step 2",
                "specifications", "warning", "caution", "safety instructions", "operation"
            ],
            "regex": [r"\b(user\s+manual|user\s+guide|instruction\s+manual)\b", r"\btroubleshooting\b", r"\binstallation\b"],
            "weight": 1.2
        },
        "Notes": {
            "keywords": [
                "meeting notes", "lecture notes", "todo", "action items", "agenda",
                "minutes of meeting", "attendees", "discussion points", "next steps", "scratchpad"
            ],
            "regex": [r"\b(meeting\s+notes|minutes\s+of\s+meeting|action\s+items)\b", r"\battendees\b"],
            "weight": 1.1
        },
    }

    @classmethod
    def classify(cls, text: str, filename: str = "") -> Tuple[str, float]:
        """Classifies document text and filename into a category and confidence (0.0 - 1.0)."""
        if not text and not filename:
            return "Unknown", 0.0

        text_lower = (text or "").lower()
        filename_lower = (filename or "").lower()
        scores: Dict[str, float] = {}

        # 1. Filename heuristic
        for category in cls.CATEGORIES:
            cat_keywords = cls.CATEGORIES[category]["keywords"]
            if category.lower() in filename_lower:
                scores[category] = scores.get(category, 0.0) + 3.0
            for kw in cat_keywords[:5]:
                if kw in filename_lower:
                    scores[category] = scores.get(category, 0.0) + 2.0

        # 2. Content keyword frequency & regex patterns
        words = re.findall(r"\b[a-z]{3,}\b", text_lower)
        total_words = max(len(words), 1)

        for category, config in cls.CATEGORIES.items():
            category_score = scores.get(category, 0.0)
            weight = config.get("weight", 1.0)

            # Check keyword presence & density
            kw_hits = 0
            for kw in config["keywords"]:
                if " " in kw:
                    # phrase match
                    matches = len(re.findall(re.escape(kw), text_lower))
                    kw_hits += matches * 2
                else:
                    matches = words.count(kw)
                    kw_hits += matches

            # Regex patterns
            regex_hits = 0
            for pattern in config.get("regex", []):
                if re.search(pattern, text_lower):
                    regex_hits += 2

            score = (kw_hits * 1.5 + regex_hits * 3.0) * weight
            scores[category] = category_score + score

        if not scores:
            return "General Document", 0.5

        # Determine best category
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        best_category, top_score = sorted_scores[0]

        if top_score < 2.0:
            return "General Document", 0.45

        # Normalize confidence to 0.50 - 0.98 range
        confidence = min(0.98, max(0.50, round(0.50 + (top_score / (top_score + 15.0)) * 0.48, 2)))
        return best_category, confidence

import re
from typing import List, Dict, Any
from collections import Counter


class EntityExtractor:
    """Extracts Named Entities (NER) across 9 entity types using NLP heuristics and regex patterns."""

    KNOWN_TECH = {
        "Python", "JavaScript", "TypeScript", "React", "Node.js", "Flask", "Django",
        "FastAPI", "Docker", "Kubernetes", "PostgreSQL", "MongoDB", "Redis",
        "AWS", "Azure", "GCP", "PyTorch", "TensorFlow", "OpenAI", "Git", "Linux",
        "GraphQL", "REST", "HTML5", "CSS3", "Tailwind", "Java", "C++", "Rust", "Go"
    }

    KNOWN_ORGS = {
        "Google", "Microsoft", "Amazon", "Apple", "Meta", "OpenAI", "IBM", "Oracle",
        "Salesforce", "Nvidia", "Adobe", "Intel", "Cisco", "DeepMind", "Stanford",
        "MIT", "Harvard", "Oxford", "Berkeley", "GitHub", "Anthropic", "Stripe"
    }

    KNOWN_LOCATIONS = {
        "United States", "USA", "California", "San Francisco", "New York", "London",
        "United Kingdom", "UK", "Canada", "Toronto", "Germany", "Berlin", "France",
        "Paris", "India", "Bangalore", "Delhi", "Mumbai", "Tokyo", "Japan", "Singapore",
        "Australia", "Sydney", "Europe", "Asia", "North America", "Seattle", "Austin"
    }

    @classmethod
    def extract_entities(cls, text: str) -> List[Dict[str, Any]]:
        """Extracts and groups entities with frequency counts and confidence scores."""
        if not text:
            return []

        raw_entities: List[Dict[str, str]] = []

        # 1. EMAIL
        email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
        for match in re.finditer(email_pattern, text):
            raw_entities.append({"type": "EMAIL", "val": match.group(0)})

        # 2. PHONE
        phone_pattern = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"
        for match in re.finditer(phone_pattern, text):
            raw_entities.append({"type": "PHONE", "val": match.group(0)})

        # 3. MONEY / CURRENCY
        money_pattern = r"[$€£₹]\s*[\d,]+(?:\.\d{2})?|\b[\d,]+(?:\.\d{2})?\s*(?:USD|EUR|GBP|INR|CAD|AUD)\b"
        for match in re.finditer(money_pattern, text, re.IGNORECASE):
            raw_entities.append({"type": "MONEY", "val": match.group(0)})

        # 4. DATE
        date_pattern = r"\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}|(?:19|20)\d{2})\b"
        for match in re.finditer(date_pattern, text, re.IGNORECASE):
            val = match.group(0)
            if len(val) >= 4:
                raw_entities.append({"type": "DATE", "val": val})

        # 5. TECHNOLOGY
        for tech in cls.KNOWN_TECH:
            pattern = r"\b" + re.escape(tech) + r"\b"
            for _ in re.finditer(pattern, text, re.IGNORECASE):
                raw_entities.append({"type": "TECHNOLOGY", "val": tech})

        # 6. ORGANIZATION
        for org in cls.KNOWN_ORGS:
            pattern = r"\b" + re.escape(org) + r"\b"
            for _ in re.finditer(pattern, text, re.IGNORECASE):
                raw_entities.append({"type": "ORGANIZATION", "val": org})

        # 7. LOCATION
        for loc in cls.KNOWN_LOCATIONS:
            pattern = r"\b" + re.escape(loc) + r"\b"
            for _ in re.finditer(pattern, text, re.IGNORECASE):
                raw_entities.append({"type": "LOCATION", "val": loc})

        # 8. PERSON (Proper noun pairs heuristic: e.g. "John Smith", "Dr. Alan Turing")
        person_pattern = r"\b(?:Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)?\s*([A-Z][a-z]{2,15}\s+[A-Z][a-z]{2,15})\b"
        for match in re.finditer(person_pattern, text):
            candidate = match.group(1).strip()
            # Filter out known non-person matches
            if candidate not in cls.KNOWN_ORGS and candidate not in cls.KNOWN_LOCATIONS:
                raw_entities.append({"type": "PERSON", "val": candidate})

        # 9. PRODUCT
        product_pattern = r"\b([A-Z][a-zA-Z0-9]+(?:\s+(?:Pro|Max|Plus|v\d+|Engine|Platform|Suite|Service|API|SDK|Framework))\b)"
        for match in re.finditer(product_pattern, text):
            raw_entities.append({"type": "PRODUCT", "val": match.group(1)})

        # Aggregate counts
        grouped: Dict[tuple, int] = Counter((e["type"], e["val"]) for e in raw_entities)
        results = []
        for (ent_type, ent_val), count in grouped.most_common(50):
            results.append({
                "entity_type": ent_type,
                "entity_value": ent_val,
                "count": count,
                "confidence": 0.95 if ent_type in ["EMAIL", "PHONE", "MONEY", "TECHNOLOGY"] else 0.85,
            })

        return results

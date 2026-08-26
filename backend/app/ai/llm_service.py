import re
from typing import Dict, Any, List


class LLMService:
    """Unified LLM abstraction layer supporting OpenAI, Ollama, and Local Deterministic QA synthesis."""

    def __init__(self, provider: str = "fallback", api_key: str = "", model: str = "", base_url: str = ""):
        self.provider = provider or "fallback"
        self.api_key = api_key or ""
        self.model = model or "gpt-4o-mini"
        self.base_url = base_url or "http://localhost:11434"

    def answer_question(self, question: str, context_chunks: List[Dict[str, Any]], system_prompt: str = "") -> Dict[str, Any]:
        """Answers a question based strictly on the retrieved document context chunks."""
        if not context_chunks:
            return {
                "answer": "I could not find any relevant information in the uploaded documents to answer your question.",
                "provider": self.provider,
                "sources": [],
            }

        # Format context
        context_str = ""
        sources = []
        for chunk in context_chunks:
            doc_id = chunk.get("document_id")
            doc_title = chunk.get("document_title", "Document")
            page_num = chunk.get("page_number", 1)
            text = chunk.get("text_content", "")
            score = chunk.get("score", 0.0)

            context_str += f"\n--- Source: {doc_title} (Page {page_num}) ---\n{text}\n"
            sources.append({
                "document_id": doc_id,
                "document_title": doc_title,
                "page_number": page_num,
                "excerpt": text[:180] + ("..." if len(text) > 180 else ""),
                "score": round(score, 3),
            })

        # Check external provider if configured
        if self.provider == "openai" and self.api_key:
            try:
                import requests
                headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
                messages = [
                    {"role": "system", "content": system_prompt or "You are an expert Document Intelligence Assistant. Answer the user question accurately and truthfully using ONLY the provided document context. If the answer is not in the context, say you do not know. Cite document names and page numbers where applicable."},
                    {"role": "user", "content": f"Context:\n{context_str}\n\nQuestion: {question}"}
                ]
                resp = requests.post("https://api.openai.com/v1/chat/completions", json={"model": self.model, "messages": messages, "temperature": 0.2}, headers=headers, timeout=15)
                if resp.status_code == 200:
                    ans = resp.json()["choices"][0]["message"]["content"]
                    return {"answer": ans, "provider": "openai", "sources": sources}
            except Exception:
                pass

        if self.provider == "ollama" and self.base_url:
            try:
                import requests
                prompt = f"{system_prompt}\n\nContext:\n{context_str}\n\nQuestion: {question}\n\nAnswer:"
                resp = requests.post(f"{self.base_url}/api/generate", json={"model": self.model or "llama3.2", "prompt": prompt, "stream": False}, timeout=20)
                if resp.status_code == 200:
                    ans = resp.json()["response"]
                    return {"answer": ans, "provider": "ollama", "sources": sources}
            except Exception:
                pass

        # Deterministic Extractive QA Synthesis Fallback
        answer = self._synthesize_extractive_answer(question, context_chunks)
        return {
            "answer": answer,
            "provider": "deterministic_rag_synthesizer",
            "sources": sources,
        }

    def _synthesize_extractive_answer(self, question: str, context_chunks: List[Dict[str, Any]]) -> str:
        """Synthesizes high-quality answers from top relevant passages matching question intent."""
        q_words = set(re.findall(r"\b[a-z]{3,}\b", question.lower()))
        stopwords = {"what", "when", "where", "which", "who", "whom", "whose", "why", "how", "does", "have", "with", "this", "that", "from", "were", "been"}
        target_words = q_words - stopwords

        best_sentences = []
        for chunk in context_chunks:
            doc_title = chunk.get("document_title", "Document")
            page_num = chunk.get("page_number", 1)
            text = chunk.get("text_content", "")

            sentences = re.split(r"(?<=[.!?])\s+", text)
            for sent in sentences:
                s_lower = sent.lower()
                sent_words = set(re.findall(r"\b[a-z]{3,}\b", s_lower))
                overlap = len(target_words.intersection(sent_words)) if target_words else 1

                if overlap > 0 and len(sent.strip()) > 20:
                    best_sentences.append({
                        "sentence": sent.strip(),
                        "doc_title": doc_title,
                        "page_num": page_num,
                        "overlap": overlap,
                        "score": chunk.get("score", 0.5) * overlap,
                    })

        if not best_sentences:
            # Return top chunk excerpt directly
            top_chunk = context_chunks[0]
            doc_title = top_chunk.get("document_title", "the document")
            page_num = top_chunk.get("page_number", 1)
            return f"According to **{doc_title}** (Page {page_num}):\n\n> \"{top_chunk.get('text_content', '')[:350]}...\""

        # Sort by relevance score
        sorted_sents = sorted(best_sentences, key=lambda x: x["score"], reverse=True)
        top_matches = sorted_sents[:3]

        answer_parts = [f"Based on the analysis of the retrieved document sections:"]
        seen_sents = set()
        for match in top_matches:
            s_text = match["sentence"]
            if s_text not in seen_sents:
                seen_sents.add(s_text)
                answer_parts.append(f"- **{match['doc_title']} (Page {match['page_num']})**: \"{s_text}\"")

        return "\n\n".join(answer_parts)

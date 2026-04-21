from typing import Optional, Dict, Any

import httpx

from app.core.config import settings


GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
DEFAULT_GEMINI_MODEL = "gemini-flash-latest"


class LLMError(Exception):
    def __init__(self, message: str, status_code: int = 500, details: Any = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


def _estimate_cost(tokens: int, provider: str, model: str) -> float:
    """Rough cost estimate. Extend with real pricing tables as needed."""
    # Gemini Flash pricing approximation: $0.075 per 1M input tokens
    if provider == "gemini":
        return round(tokens * 0.000000075, 8)
    if provider == "openai":
        return round(tokens * 0.0000005, 8)
    return 0.0


def call_gemini(
    prompt: str, model: str = DEFAULT_GEMINI_MODEL
) -> Dict[str, Any]:
    api_key = settings.GEMINI_API_KEY
    if not api_key or api_key == "your_gemini_api_key_here":
        raise LLMError("Gemini API key is not configured", status_code=500)

    url = f"{GEMINI_BASE_URL}/{model}:generateContent"
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": api_key,
    }
    body = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        with httpx.Client(timeout=60.0) as client:
            response = client.post(url, headers=headers, json=body)
    except httpx.HTTPError as exc:
        raise LLMError(f"Gemini request failed: {exc}", status_code=502)

    if response.status_code != 200:
        raise LLMError(
            f"Gemini API error ({response.status_code})",
            status_code=response.status_code,
            details=response.text,
        )

    data = response.json()
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        raise LLMError("Gemini returned an unexpected response shape", details=data)

    usage = data.get("usageMetadata", {}) or {}
    total_tokens = usage.get("totalTokenCount", 0)

    return {
        "text": text,
        "provider": "gemini",
        "model": model,
        "tokens_used": total_tokens,
        "cost": _estimate_cost(total_tokens, "gemini", model),
        "raw_usage": usage,
    }


def generate_response(
    prompt: str,
    provider: Optional[str] = None,
    model: Optional[str] = None,
) -> Dict[str, Any]:
    """Generate a response using the configured LLM provider."""
    provider = (provider or "gemini").lower()

    if provider == "gemini":
        return call_gemini(prompt, model or DEFAULT_GEMINI_MODEL)

    # Extend here for OpenAI or other providers.
    raise LLMError(f"Provider '{provider}' is not supported yet", status_code=400)

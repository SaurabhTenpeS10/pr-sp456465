import hashlib
from datetime import datetime
from typing import Optional, Tuple

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.cache import CacheEntry


def normalize_query(query: str) -> str:
    return " ".join(query.lower().strip().split())


def hash_query(query: str) -> str:
    return hashlib.sha256(normalize_query(query).encode("utf-8")).hexdigest()


def find_cached_response(
    db: Session, user_id: str, query: str
) -> Tuple[Optional[CacheEntry], bool]:
    """
    Look up a cached response using the hybrid strategy:
      1. Check the user's own cache.
      2. Fall back to the shared global cache.

    Returns a tuple of (cache_entry, from_global_cache).
    """
    q_hash = hash_query(query)

    user_entry = (
        db.query(CacheEntry)
        .filter(CacheEntry.user_id == user_id, CacheEntry.query_hash == q_hash)
        .first()
    )
    if user_entry:
        user_entry.hit_count = (user_entry.hit_count or 0) + 1
        user_entry.accessed_at = datetime.utcnow()
        db.commit()
        db.refresh(user_entry)
        return user_entry, False

    global_entry = (
        db.query(CacheEntry)
        .filter(
            CacheEntry.query_hash == q_hash,
            CacheEntry.is_global_cache.is_(True),
            CacheEntry.user_id != user_id,
        )
        .order_by(CacheEntry.created_at.asc())
        .first()
    )
    if global_entry:
        global_entry.global_hits = (global_entry.global_hits or 0) + 1
        global_entry.accessed_at = datetime.utcnow()
        db.commit()
        db.refresh(global_entry)
        return global_entry, True

    return None, False


def store_cache_entry(
    db: Session,
    user_id: str,
    query: str,
    response: str,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    cost: float = 0.0,
    tokens_used: int = 0,
    is_global_cache: bool = True,
) -> CacheEntry:
    entry = CacheEntry(
        user_id=user_id,
        query_hash=hash_query(query),
        query_text=query,
        response_text=response,
        provider=provider,
        model=model,
        cost=cost,
        tokens_used=tokens_used,
        is_global_cache=is_global_cache,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def copy_global_entry_to_user(
    db: Session, user_id: str, source: CacheEntry
) -> CacheEntry:
    """Copy a global cache entry into the user's personal cache for faster future lookups."""
    copy = CacheEntry(
        user_id=user_id,
        query_hash=source.query_hash,
        query_text=source.query_text,
        response_text=source.response_text,
        provider=source.provider,
        model=source.model,
        cost=source.cost,
        tokens_used=source.tokens_used,
        is_global_cache=False,
        hit_count=1,
    )
    db.add(copy)
    db.commit()
    db.refresh(copy)
    return copy


def get_user_cache_stats(db: Session, user_id: str) -> dict:
    total_entries = (
        db.query(func.count(CacheEntry.id))
        .filter(CacheEntry.user_id == user_id)
        .scalar()
        or 0
    )
    total_hits = (
        db.query(func.coalesce(func.sum(CacheEntry.hit_count), 0))
        .filter(CacheEntry.user_id == user_id)
        .scalar()
        or 0
    )
    total_cost_saved = (
        db.query(func.coalesce(func.sum(CacheEntry.cost), 0))
        .filter(CacheEntry.user_id == user_id)
        .scalar()
        or 0
    )
    return {
        "total_entries": int(total_entries),
        "total_hits": int(total_hits),
        "total_cost_saved": float(total_cost_saved),
    }

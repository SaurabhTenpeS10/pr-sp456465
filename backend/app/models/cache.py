import uuid

from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    ForeignKey,
    Boolean,
    Integer,
    Numeric,
    Index,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class CacheEntry(Base):
    __tablename__ = "cache_entries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    query_hash = Column(String(64), nullable=False, index=True)
    query_text = Column(Text, nullable=False)
    response_text = Column(Text, nullable=False)

    provider = Column(String(50), nullable=True)
    model = Column(String(100), nullable=True)
    cost = Column(Numeric(12, 6), default=0, nullable=False)
    tokens_used = Column(Integer, default=0, nullable=False)

    is_global_cache = Column(Boolean, default=True, nullable=False)
    hit_count = Column(Integer, default=0, nullable=False)
    global_hits = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    accessed_at = Column(DateTime, server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="cache_entries")

    __table_args__ = (
        Index("idx_user_query_hash", "user_id", "query_hash"),
        Index("idx_global_query_hash", "query_hash", "is_global_cache"),
    )

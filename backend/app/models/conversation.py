import uuid

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title = Column(String(255), nullable=True)
    description = Column(String(1024), nullable=True)
    model = Column(String(100), default="gemini-flash-latest", nullable=False)
    provider = Column(String(50), default="gemini", nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user = relationship("User", back_populates="conversations")
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )

    @property
    def message_count(self) -> int:
        return len(self.messages) if self.messages is not None else 0

    @property
    def last_message(self):
        if not self.messages:
            return None

        for message in reversed(self.messages):
            if message.role == 'assistant':
                return message

        return self.messages[-1]

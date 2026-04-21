from datetime import datetime
from typing import Optional, List, Any, Dict

from pydantic import BaseModel, Field, ConfigDict


class ConversationCreate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1024)
    model: Optional[str] = None
    provider: Optional[str] = None


class ConversationUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1024)
    is_archived: Optional[bool] = None


class MessageCreate(BaseModel):
    content: str = Field(min_length=1)
    model: Optional[str] = None
    provider: Optional[str] = None


class MessageRegenerateRequest(BaseModel):
    model: Optional[str] = None
    provider: Optional[str] = None


class MessageOut(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    metadata: Optional[Dict[str, Any]] = Field(default=None, alias="meta")
    is_edited: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ConversationOut(BaseModel):
    id: str
    user_id: str
    title: Optional[str]
    description: Optional[str]
    model: str
    provider: str
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    last_message: Optional[MessageOut] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class SendMessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    metadata: Optional[Dict[str, Any]] = Field(default=None, alias="meta")
    is_edited: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class SendMessageResponse(BaseModel):
    user_message: MessageOut
    assistant_message: MessageOut
    cache_hit: bool
    response_time_ms: int


class ConversationListResponse(BaseModel):
    conversations: List[ConversationOut]
    total: int


class MessageListResponse(BaseModel):
    messages: List[MessageOut]
    total: int

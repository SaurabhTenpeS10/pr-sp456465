from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.conversation import Conversation
from app.models.user import User
from app.schemas.chat import (
    ConversationCreate,
    ConversationUpdate,
    ConversationOut,
    ConversationListResponse,
)

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("", response_model=ConversationOut, status_code=status.HTTP_201_CREATED)
def create_conversation(
    payload: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = Conversation(
        user_id=current_user.id,
        title=payload.title or "New Conversation",
        description=payload.description,
        model=payload.model or "gemini-flash-latest",
        provider=payload.provider or "gemini",
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


@router.get("", response_model=ConversationListResponse)
def list_conversations(
    include_archived: bool = False,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Conversation).options(selectinload(Conversation.messages)).filter(Conversation.user_id == current_user.id)
    if not include_archived:
        query = query.filter(Conversation.is_archived.is_(False))

    total = query.with_entities(func.count(Conversation.id)).scalar() or 0
    conversations = (
        query.order_by(Conversation.updated_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )
    return ConversationListResponse(conversations=conversations, total=total)


@router.get("/{conversation_id}", response_model=ConversationOut)
def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = _get_user_conversation(db, conversation_id, current_user.id)
    return conversation


@router.patch("/{conversation_id}", response_model=ConversationOut)
def update_conversation(
    conversation_id: str,
    payload: ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = _get_user_conversation(db, conversation_id, current_user.id)
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(conversation, field, value)
    db.commit()
    db.refresh(conversation)
    return conversation


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = _get_user_conversation(db, conversation_id, current_user.id)
    db.delete(conversation)
    db.commit()
    return None


def _get_user_conversation(
    db: Session, conversation_id: str, user_id: str
) -> Conversation:
    conversation = (
        db.query(Conversation)
        .options(selectinload(Conversation.messages))
        .filter(Conversation.id == conversation_id, Conversation.user_id == user_id)
        .first()
    )
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
        )
    return conversation

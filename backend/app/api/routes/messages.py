import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.schemas.chat import (
    MessageCreate,
    MessageRegenerateRequest,
    MessageOut,
    MessageListResponse,
    SendMessageResponse,
)
from app.services import cache_service, llm_service

router = APIRouter(tags=["messages"])


def _get_user_conversation(db: Session, conversation_id: str, user_id: str) -> Conversation:
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == user_id)
        .first()
    )
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
        )
    return conversation


def _generate_title_from_message(message: str, max_length: int = 50) -> str:
    """Generate a conversation title from the first message."""
    # Clean the message: trim and replace newlines with spaces
    cleaned = message.strip().replace("\n", " ")
    
    # Truncate to max_length with ellipsis if needed
    if len(cleaned) > max_length:
        return cleaned[:max_length] + "..."
    return cleaned


@router.get(
    "/conversations/{conversation_id}/messages", response_model=MessageListResponse
)
def list_messages(
    conversation_id: str,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_user_conversation(db, conversation_id, current_user.id)

    query = db.query(Message).filter(Message.conversation_id == conversation_id)
    total = query.with_entities(func.count(Message.id)).scalar() or 0
    messages = (
        query.order_by(Message.created_at.asc()).limit(limit).offset(offset).all()
    )
    return MessageListResponse(messages=messages, total=total)


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=SendMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def send_message(
    conversation_id: str,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = _get_user_conversation(db, conversation_id, current_user.id)

    # Auto-generate conversation title from first message if it's still "New Conversation"
    if conversation.title == "New Conversation" and conversation.message_count == 0:
        title = _generate_title_from_message(payload.content)
        conversation.title = title
        db.commit()

    provider = payload.provider or conversation.provider
    model = payload.model or conversation.model

    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=payload.content,
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    start = time.perf_counter()
    cache_entry, from_global = cache_service.find_cached_response(
        db, current_user.id, payload.content
    )

    cache_hit = False
    response_text: str
    response_meta: dict

    if cache_entry is not None:
        cache_hit = True
        response_text = cache_entry.response_text
        response_meta = {
            "provider": cache_entry.provider,
            "model": cache_entry.model,
            "cache_hit": True,
            "cache_source": "global" if from_global else "user",
            "cost": 0.0,
            "original_cost": float(cache_entry.cost or 0),
            "tokens_used": cache_entry.tokens_used or 0,
        }
        if from_global:
            cache_service.copy_global_entry_to_user(db, current_user.id, cache_entry)
    else:
        try:
            llm_result = llm_service.generate_response(
                payload.content, provider=provider, model=model
            )
        except llm_service.LLMError as exc:
            raise HTTPException(status_code=exc.status_code, detail=str(exc))

        response_text = llm_result["text"]
        response_meta = {
            "provider": llm_result["provider"],
            "model": llm_result["model"],
            "cache_hit": False,
            "cost": llm_result["cost"],
            "tokens_used": llm_result["tokens_used"],
        }

        cache_service.store_cache_entry(
            db,
            user_id=current_user.id,
            query=payload.content,
            response=response_text,
            provider=llm_result["provider"],
            model=llm_result["model"],
            cost=llm_result["cost"],
            tokens_used=llm_result["tokens_used"],
            is_global_cache=True,
        )

    elapsed_ms = int((time.perf_counter() - start) * 1000)
    response_meta["response_time_ms"] = elapsed_ms

    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=response_text,
        meta=response_meta,
    )
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    return SendMessageResponse(
        user_message=MessageOut.model_validate(user_message),
        assistant_message=MessageOut.model_validate(assistant_message),
        cache_hit=cache_hit,
        response_time_ms=elapsed_ms,
    )


@router.post(
    "/messages/{message_id}/regenerate",
    response_model=SendMessageResponse,
    status_code=status.HTTP_200_OK,
)
def regenerate_message(
    message_id: str,
    payload: MessageRegenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assistant_message = (
        db.query(Message)
        .filter(Message.id == message_id, Message.role == "assistant")
        .first()
    )
    if not assistant_message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant message not found",
        )

    conversation = _get_user_conversation(
        db, assistant_message.conversation_id, current_user.id
    )

    previous_user_message = (
        db.query(Message)
        .filter(
            Message.conversation_id == conversation.id,
            Message.role == "user",
            Message.created_at < assistant_message.created_at,
        )
        .order_by(Message.created_at.desc())
        .first()
    )
    if not previous_user_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No previous user message found to regenerate response",
        )

    provider = payload.provider or conversation.provider
    model = payload.model or conversation.model

    cache_entry, from_global = cache_service.find_cached_response(
        db, current_user.id, previous_user_message.content
    )

    cache_hit = False
    response_text: str
    response_meta: dict

    if cache_entry is not None:
        cache_hit = True
        response_text = cache_entry.response_text
        response_meta = {
            "provider": cache_entry.provider,
            "model": cache_entry.model,
            "cache_hit": True,
            "cache_source": "global" if from_global else "user",
            "cost": 0.0,
            "original_cost": float(cache_entry.cost or 0),
            "tokens_used": cache_entry.tokens_used or 0,
        }
        if from_global:
            cache_service.copy_global_entry_to_user(db, current_user.id, cache_entry)
    else:
        try:
            llm_result = llm_service.generate_response(
                previous_user_message.content,
                provider=provider,
                model=model,
            )
        except llm_service.LLMError as exc:
            raise HTTPException(status_code=exc.status_code, detail=str(exc))

        response_text = llm_result["text"]
        response_meta = {
            "provider": llm_result["provider"],
            "model": llm_result["model"],
            "cache_hit": False,
            "cost": llm_result["cost"],
            "tokens_used": llm_result["tokens_used"],
        }

        cache_service.store_cache_entry(
            db,
            user_id=current_user.id,
            query=previous_user_message.content,
            response=response_text,
            provider=llm_result["provider"],
            model=llm_result["model"],
            cost=llm_result["cost"],
            tokens_used=llm_result["tokens_used"],
            is_global_cache=True,
        )

    assistant_message.content = response_text
    assistant_message.meta = response_meta
    assistant_message.is_edited = True
    db.commit()
    db.refresh(assistant_message)

    return SendMessageResponse(
        user_message=MessageOut.model_validate(previous_user_message),
        assistant_message=MessageOut.model_validate(assistant_message),
        cache_hit=cache_hit,
        response_time_ms=0,
    )


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(
    message_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    message = (
        db.query(Message)
        .join(Conversation, Conversation.id == Message.conversation_id)
        .filter(Message.id == message_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )

    paired_message = None
    if message.role == "assistant":
        paired_message = (
            db.query(Message)
            .filter(
                Message.conversation_id == message.conversation_id,
                Message.role == "user",
                Message.created_at < message.created_at,
            )
            .order_by(Message.created_at.desc())
            .first()
        )
    elif message.role == "user":
        paired_message = (
            db.query(Message)
            .filter(
                Message.conversation_id == message.conversation_id,
                Message.role == "assistant",
                Message.created_at > message.created_at,
            )
            .order_by(Message.created_at.asc())
            .first()
        )

    db.delete(message)
    if paired_message:
        db.delete(paired_message)
    db.commit()

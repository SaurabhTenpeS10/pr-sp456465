# Backend & Database Architecture Documentation

This document provides an in-depth look at how the PromptSplitwise backend operates, focusing heavily on its database architecture, interactions, and data flow.

## 1. Backend Overview

The backend is built using **FastAPI** (Python). It is designed to handle RESTful API requests from the frontend, manage user authentication, process LLM interactions (like Google Gemini), and implement an intelligent caching layer to save on API costs.

### Key Components:
- **FastAPI Application (`app/main.py`)**: The entry point. It sets up CORS, handles the startup lifespan (initializing the database), and registers routers for `/api/auth` and `/api/v1/conversations`.
- **Dependency Injection (`app/api/deps.py`)**: Uses FastAPI's `Depends` to inject the database session (`get_db`) and the currently authenticated user (`get_current_user`) into route handlers.
- **Services (`app/services/`)**: Contains the core business logic separated from API routing:
  - `auth_service.py`: JWT generation, password hashing, and user validation.
  - `llm_service.py`: Direct HTTP calls to Google Gemini via `httpx`.
  - `cache_service.py`: Advanced logic for checking global and user-specific caches.

---

## 2. Database Configuration

The application uses **MySQL** as its relational database.

### Connection Setup (`app/core/database.py`)
- **SQLAlchemy Engine**: Connects to MySQL using the `pymysql` driver (`mysql+pymysql://...`).
- **Connection Pooling**: Uses `pool_pre_ping=True` and `pool_recycle=3600` to ensure database connections remain healthy and don't timeout silently.
- **Session Management**: The `get_db()` generator provides an isolated `SessionLocal` for every API request, ensuring transactions are committed or rolled back safely, and connections are closed when the request finishes.
- **Auto-Initialization**: During the FastAPI startup event (`lifespan`), `init_db()` is called. It connects without specifying a database to run `CREATE DATABASE IF NOT EXISTS promptsplitwise`, and then uses SQLAlchemy's `Base.metadata.create_all()` to create the necessary tables.

---

## 3. Database Schema & Models

The database schema is defined using SQLAlchemy's Declarative Base (`app/models/`). All tables use auto-generated UUID strings (36 characters) as primary keys.

### 3.1. Users (`users` table)
Stores user credentials and profile information.
- **Primary Key**: `id` (UUID)
- **Fields**: `email` (Unique, Indexed), `password_hash`, `name`, `avatar_url`, `subscription_tier`, `is_active`.
- **Relationships**: 
  - `conversations`: One-to-Many with the `Conversation` model (Cascade delete).
  - `cache_entries`: One-to-Many with the `CacheEntry` model (Cascade delete).

### 3.2. Conversations (`conversations` table)
Groups messages into chat sessions for a specific user.
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `user_id` -> `users.id` (Indexed)
- **Fields**: `title`, `description`, `model` (e.g., gemini-flash-latest), `provider` (e.g., gemini), `is_archived`.
- **Relationships**:
  - `user`: Many-to-One back to `User`.
  - `messages`: One-to-Many with the `Message` model (Cascade delete, ordered by creation time).

### 3.3. Messages (`messages` table)
Stores individual chat bubbles within a conversation.
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `conversation_id` -> `conversations.id` (Indexed)
- **Fields**: 
  - `role`: "user" or "assistant".
  - `content`: The text body of the message.
  - `meta` (JSON column): Stores metadata like tokens used, API cost, caching info (hit/miss), and response time.
  - `is_edited`: Boolean flag.
- **Relationships**:
  - `conversation`: Many-to-One back to `Conversation`.

### 3.4. Cache Entries (`cache_entries` table)
The core of the "PromptCache" functionality, storing previously generated LLM responses to prevent redundant API calls.
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `user_id` -> `users.id` (Indexed)
- **Fields**:
  - `query_hash`: A SHA256 hash of the normalized (lowercased, stripped) user query. This is heavily indexed for fast lookups.
  - `query_text` & `response_text`: The actual prompt and LLM response.
  - `provider` & `model`: Details of the LLM used.
  - `cost` & `tokens_used`: API usage statistics.
  - `is_global_cache`: Boolean determining if this entry can be shared across all users.
  - `hit_count` & `global_hits`: Analytics tracking how often a cache entry is reused.

---

## 4. How the Data Flows (Step-by-Step Example)

Let's trace what happens in the database when a user sends a message via the `/conversations/{id}/messages` endpoint.

1. **Authentication**: The `get_current_user` dependency intercepts the JWT token, decodes the `user_id`, queries the `users` table, and attaches the `User` object to the request.
2. **Conversation Lookup**: The backend queries the `conversations` table to ensure the `conversation_id` belongs to the authenticated user.
3. **Save User Message**: A new `Message` object with `role="user"` is created, added to the DB session, and committed.
4. **Cache Lookup**: 
   - The user's query is normalized and hashed (`query_hash`).
   - The backend checks `cache_entries` for an exact `query_hash` match belonging to this `user_id`.
   - *If missed*, it checks `cache_entries` for an exact `query_hash` where `is_global_cache=True`.
5. **LLM Generation & Cache Storing** (On Cache Miss):
   - The backend calls the Gemini API (`llm_service.py`).
   - The LLM returns a response, token usage, and cost.
   - A new `CacheEntry` is created in the database and flagged as `is_global_cache=True` so others can benefit from it.
6. **Save Assistant Message**: A new `Message` object with `role="assistant"` is created, containing the response text and metadata (whether it was a cache hit, the cost, etc.). It is saved to the database.
7. **Response**: The frontend receives both the saved user message and the assistant message.

---

## 5. Security & Performance Considerations

- **Indexing**: High-traffic lookups, such as finding a user by `email`, finding conversations by `user_id`, or looking up cache hits by `query_hash`, are all optimized using database indexes.
- **Cascading Deletes**: When a `User` is deleted, their `Conversations` and `CacheEntries` are automatically deleted by SQLAlchemy. Similarly, deleting a `Conversation` wipes its `Messages`.
- **Connection Pooling**: SQL transactions are kept short to avoid locking the MySQL tables and connection pool exhaustion.

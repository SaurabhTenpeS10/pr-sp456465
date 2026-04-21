# PromptSplitwise Project Documentation

This document provides a comprehensive overview of the PromptSplitwise project, including its architecture, configuration, technology stack, and instructions for setup and deployment.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Configuration & Environment Variables](#configuration--environment-variables)
6. [Backend Details](#backend-details)
7. [Frontend Details](#frontend-details)
8. [Setup & Installation](#setup--installation)
9. [Available Scripts](#available-scripts)

---

## 1. Project Overview

**PromptSplitwise** (also referred to as PromptCache AI in the frontend config) is a full-stack application designed to interact with Large Language Models (LLMs) like Google Gemini. It offers intelligent response caching to reduce API costs and improve response times for repetitive queries. 

Key features include:
- User authentication (JWT based)
- Conversation and message management
- AI query caching (Global and User-level)
- Real-time interaction with AI models
- Chat history and conversation archiving
- Customizable settings for LLM generation

---

## 2. Architecture

The project follows a standard client-server architecture:
- **Frontend**: A React.js web application providing a modern, responsive user interface.
- **Backend**: A FastAPI Python application providing RESTful APIs.
- **Database**: MySQL database for persisting users, conversations, messages, and cache entries.

### Communication Flow
1. The user interacts with the React frontend.
2. The frontend makes HTTP requests via Axios to the backend API (`/api/v1` for chat, `/api/auth` for authentication).
3. The backend processes the request, optionally checking the MySQL database for cached LLM responses.
4. If a cache miss occurs, the backend queries the LLM provider (e.g., Gemini API).
5. The backend returns the response to the frontend and updates the cache.

---

## 3. Technology Stack

### Backend Stack
- **Framework**: FastAPI
- **Language**: Python 3.x
- **Database ORM**: SQLAlchemy 2.0
- **Database**: MySQL (via `pymysql`)
- **Authentication**: JWT (python-jose), Passlib (bcrypt)
- **LLM Integration**: `google-generativeai`, `httpx` (for direct API calls)
- **Server**: Uvicorn

### Frontend Stack
- **Framework**: React.js 14 (App Router)
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (Client state), React Query (Server state)
- **API Client**: Axios
- **Form Validation**: React Hook Form with Zod
- **Icons**: Lucide React, Heroicons

---

## 4. Folder Structure

```text
/ (Root)
├── backend/                  # Python FastAPI Backend
│   ├── app/                  # Main application package
│   │   ├── api/              # API routes and dependencies
│   │   ├── core/             # Configuration, database, and security setup
│   │   ├── models/           # SQLAlchemy database models
│   │   ├── schemas/          # Pydantic schemas for request/response validation
│   │   └── services/         # Business logic (Auth, Cache, LLM interaction)
│   ├── .env                  # Backend environment variables
│   ├── requirements.txt      # Python dependencies
│   └── run.py                # Entry point to run the backend server
├── frontend/                 # React.js React Frontend
│   ├── src/                  # Source code
│   │   ├── app/              # React.js App Router pages
│   │   ├── components/       # Reusable React components (Chat, Settings, etc.)
│   │   ├── lib/              # Utilities, API services, Stores, Providers, Types
│   ├── public/               # Static assets
│   ├── .env.local            # Frontend environment variables
│   ├── next.config.js        # React.js configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── package.json          # Node.js dependencies
└── .gitignore                # Global Git ignore rules
```

---

## 5. Configuration & Environment Variables

### Backend Configuration (`backend/.env`)
The backend uses `pydantic-settings` to load configuration from the `.env` file.

| Variable | Description | Default |
|----------|-------------|---------|
| `PROJECT_NAME` | Name of the API project | `PromptSplitwise API` |
| `BACKEND_CORS_ORIGINS`| Allowed CORS origins | `["http://localhost:3000"]` |
| `MYSQL_SERVER` | MySQL host | `localhost` |
| `MYSQL_PORT` | MySQL port | `3306` |
| `MYSQL_USER` | MySQL username | `root` |
| `MYSQL_PASSWORD` | MySQL password | `root` |
| `MYSQL_DB` | Database name | `promptsplitwise` |
| `SECRET_KEY` | JWT secret key | `super-secret-key...` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| Access token expiry | `60` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiry | `7` |
| `OPENAI_API_KEY` | OpenAI API key (Optional)| - |
| `GEMINI_API_KEY` | Google Gemini API Key | - |
| `CACHE_SIMILARITY_THRESHOLD`| Threshold for fuzzy matching | `0.85` |
| `CACHE_MAX_ENTRIES_PER_USER`| Max cache entries per user | `100` |

### Frontend Configuration (`frontend/.env.local`)
The frontend uses React.js environment variables.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | The base URL of the backend API (e.g., `http://localhost:8000`) |
| `NEXT_PUBLIC_APP_NAME`| Display name of the application |
| `NEXT_PUBLIC_APP_VERSION`| Version of the application |

*Note: The frontend also contains an `.env.local.example` file for reference.*

---

## 6. Backend Details

The backend is built with **FastAPI** emphasizing modularity and performance.

### Core Modules
- **`app/main.py`**: The entry point that initializes the FastAPI app, configures CORS, handles the lifespan events (like DB initialization), and registers API routers.
- **`app/core/database.py`**: Manages the SQLAlchemy engine and session. It includes an `init_db` function that auto-creates the MySQL database and tables if they don't exist.
- **`app/core/security.py`**: Handles password hashing using `bcrypt` and JWT token creation/decoding.
- **`app/api/deps.py`**: Provides FastAPI dependencies like `get_current_user` to secure endpoints.

### API Routes
- **`/api/auth`**: Endpoints for register, login, refresh, profile, and logout.
- **`/api/v1/conversations`**: CRUD operations for chat conversations.
- **`/api/v1/conversations/{id}/messages`**: Endpoints to send and list messages within a conversation. Handles the core logic of querying the LLM and caching.

### Caching Strategy
The `cache_service.py` implements a hybrid caching mechanism:
1. When a user asks a question, it computes a SHA256 hash of the normalized query.
2. It checks the user's personal cache entries.
3. If not found, it checks the global shared cache. If found in the global cache, it copies it to the user's cache for faster subsequent access.
4. If it's a complete cache miss, it calls the LLM, returns the response, and stores a new global cache entry.

---

## 7. Frontend Details

The frontend is a modern **React.js** application using the App Router (`src/app`).

### State Management
- **Zustand (`lib/stores/chat-store.ts`)**: Manages the global chat state, including conversations, messages, loading states, and WebSocket connection references.
- **React Query (`lib/providers/query-provider.tsx`)**: Configured for data fetching and caching with a default stale time of 5 minut`es.

### Authentication Flow
Implemented in `lib/auth/context.tsx` and `lib/auth/api.ts`.
- Uses Axios interceptors to automatically attach the JWT `Authorization: Bearer <token>` to requests.
- Handles token expiration by intercepting `401 Unauthorized` responses and automatically calling the `/api/auth/refresh` endpoint using the stored refresh token.
- Uses `localStorage` and `js-cookie` to persist authentication state across reloads.

### Styling
- **Tailwind CSS**: Used extensively for utility-first styling.
- **Global CSS (`globals.css`)**: Defines custom utility classes, CSS variables for theming (light/dark mode), and animations (like `animate-fade-in`, `bg-gradient-primary`).

---

## 8. Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- MySQL Server (running locally or remotely)
- Gemini API Key

### Database Setup
1. Ensure your MySQL server is running.
2. The backend application will automatically create the database `promptsplitwise` (or as defined in `MYSQL_DB`) and necessary tables upon starting if the provided credentials (`MYSQL_USER` / `MYSQL_PASSWORD`) have the appropriate permissions.

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment:
   Edit the `backend/.env` file to include your `GEMINI_API_KEY` and verify MySQL credentials.
5. Start the backend server:
   ```bash
   python run.py
   ```
   *The API will run on http://127.0.0.1:8000. Swagger docs are available at http://127.0.0.1:8000/docs.*

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   Create or edit the `frontend/.env.local` file. Ensure `NEXT_PUBLIC_API_URL=http://localhost:8000` is set correctly.
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The application will be accessible at http://localhost:3000.*

---

## 9. Available Scripts

### Frontend (`frontend/package.json`)
- `npm run dev`: Starts the React.js development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the React.js production server.
- `npm run lint`: Runs ESLint to check for code quality issues.

### Backend
- `python run.py`: Runs the Uvicorn development server with hot-reload enabled.

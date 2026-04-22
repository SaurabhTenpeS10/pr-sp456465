# PromptSplitwise 🤖💸

> **An intelligent AI chat application that slashes LLM API costs through smart response caching.**

PromptSplitwise intercepts repetitive AI queries and serves cached responses — sharing the cost of LLM calls across users, just like splitting a bill. Built with a FastAPI backend and React.js frontend, it features a hybrid global/user-level caching engine, JWT-based auth with email OTP verification, and a sleek real-time chat interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?logo=fastapi&logoColor=white)
![React.js](https://img.shields.io/badge/React.js-14-black?logo=React.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-4479A1?logo=mysql&logoColor=white)

---

## ✨ Key Features

- 🧠 **Hybrid LLM Caching** — SHA256-based exact matching with a configurable fuzzy similarity threshold. Checks user-level cache first, then falls back to the global shared cache.
- 💬 **Real-time Chat UI** — Multi-conversation sidebar, message history, and per-response metrics (cache status, response time, cost).
- 🔐 **Secure Authentication** — JWT access/refresh token flow with email OTP verification on registration.
- 📊 **Cost Transparency** — Each AI response displays its cache hit status and estimated cost, so you always know what you're spending.
- 🌗 **Dark / Light Mode** — System-aware theme switcher built in.
- ⚙️ **Configurable LLM Settings** — Customize model parameters per conversation.

---

## 🏗️ Architecture

```
User Browser (React.js)
        │
        │  HTTP (Axios + JWT)
        ▼
FastAPI Backend
        │
        ├── Auth Service (JWT + OTP via SMTP)
        ├── Cache Service (User Cache → Global Cache → LLM)
        │       │                               │
        │       └── Cache HIT ✅               └── Cache MISS → Gemini API
        └── SQLAlchemy ORM
                │
                ▼
           MySQL Database
    (users, conversations, messages, cache)
```

---

## 🛠️ Technology Stack

| Layer        | Technology                                         |
|--------------|----------------------------------------------------|
| **Frontend** | React.js, Tailwind CSS, Zustand, React Query, Axios |
| **Backend**  | FastAPI, Python 3.9+, SQLAlchemy 2.0, Uvicorn      |
| **Database** | MySQL 8.0+                                         |
| **Auth**     | JWT (python-jose), Bcrypt (Passlib), Email OTP (SMTP) |
| **AI**       | Google Gemini API (`google-generativeai`)          |

---

## 📁 Project Structure

```
PromptSplitwise/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers & dependencies
│   │   ├── core/         # Config, database engine, security utils
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   └── services/     # Business logic (auth, cache, LLM, email)
│   ├── .env              # Backend environment variables
│   ├── requirements.txt
│   └── run.py            # Server entry point
├── frontend/
│   ├── src/
│   │   ├── app/          # React.js App Router pages
│   │   ├── components/   # UI components (Chat, Settings, Auth)
│   │   └── lib/          # Auth context, API client, stores, types
│   ├── .env.local        # Frontend environment variables
│   ├── next.config.js
│   └── package.json
├── .gitignore
├── PROJECT_DOCUMENTATION.md
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Python** 3.9+
- **MySQL** 8.0+ (running locally or remotely)
- A **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))
- An **SMTP email account** for OTP delivery (e.g., Gmail App Password)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/prompt-splitwise.git
cd prompt-splitwise
```

---

### 2. Backend Setup

```bash
cd backend
```

**Create and activate a virtual environment:**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Configure environment variables:**

Create a `backend/.env` file (or copy from an example) and fill in your values:

```env
PROJECT_NAME="PromptSplitwise API"
BACKEND_CORS_ORIGINS=["http://localhost:3000"]

# Database
MYSQL_SERVER=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DB=promptsplitwise

# Security
SECRET_KEY=your-very-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# AI Provider
GEMINI_API_KEY=your_gemini_api_key

# Email (for OTP verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Cache Settings
CACHE_SIMILARITY_THRESHOLD=0.85
CACHE_MAX_ENTRIES_PER_USER=100
```

> **Note:** The backend automatically creates the MySQL database and all tables on first startup — no manual migration needed.

**Start the backend server:**
```bash
python run.py
```

The API will be live at **http://127.0.0.1:8000**.
Interactive docs (Swagger UI) available at **http://127.0.0.1:8000/docs**.

---

### 3. Frontend Setup

```bash
cd frontend
```

**Install dependencies:**
```bash
npm install
```

**Configure environment variables:**

Create a `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=PromptSplitwise
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**Start the development server:**
```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

---

## ⚙️ API Overview

| Method | Endpoint                                  | Description                        |
|--------|-------------------------------------------|------------------------------------|
| `POST` | `/api/auth/register`                      | Register a new user (triggers OTP) |
| `POST` | `/api/auth/verify-otp`                    | Verify email OTP                   |
| `POST` | `/api/auth/login`                         | Login and receive JWT tokens       |
| `POST` | `/api/auth/refresh`                       | Refresh access token               |
| `GET`  | `/api/auth/me`                            | Get current user profile           |
| `GET`  | `/api/v1/conversations`                   | List user's conversations          |
| `POST` | `/api/v1/conversations`                   | Create a new conversation          |
| `POST` | `/api/v1/conversations/{id}/messages`     | Send a message (LLM query + cache) |
| `GET`  | `/api/v1/conversations/{id}/messages`     | Get message history                |

---

## 🧠 How Caching Works

```
User sends a query
        │
        ▼
  Normalize & Hash (SHA256)
        │
        ▼
  Check USER cache ──── HIT ──→ Return cached response ✅
        │
       MISS
        │
        ▼
  Check GLOBAL cache ── HIT ──→ Copy to user cache → Return response ✅
        │
       MISS
        │
        ▼
  Call Gemini API → Store in GLOBAL cache → Return response 🌐
```

The similarity threshold (`CACHE_SIMILARITY_THRESHOLD`) allows fuzzy matching so semantically identical queries (e.g., "What is ML?" vs "what is ml?") hit the cache even if not character-perfect.

---

## 📜 Available Scripts

### Backend
| Command           | Description                          |
|-------------------|--------------------------------------|
| `python run.py`   | Start Uvicorn dev server (hot-reload)|

### Frontend
| Command           | Description                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Start React.js development server     |
| `npm run build`   | Build for production                 |
| `npm run start`   | Start React.js production server      |
| `npm run lint`    | Run ESLint                           |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ — Split your prompts, not your wallet.
</div>

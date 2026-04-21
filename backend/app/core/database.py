from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from app.core.config import settings

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a database session."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_database_exists() -> None:
    """Create the MySQL database if it does not exist yet."""
    server_engine = create_engine(settings.SQLALCHEMY_DATABASE_URI_NO_DB)
    with server_engine.connect() as conn:
        conn.execute(
            text(
                f"CREATE DATABASE IF NOT EXISTS `{settings.MYSQL_DB}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        )
    server_engine.dispose()


def init_db() -> None:
    """Create all tables defined on the Base metadata."""
    # Import models so they are registered with Base.metadata
    from app.models import user, conversation, message, cache  # noqa: F401

    ensure_database_exists()
    Base.metadata.create_all(bind=engine)
    
    # Simple migration to add otp columns if missing
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN otp_code VARCHAR(10) NULL;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN otp_expires_at DATETIME NULL;"))
    except Exception as e:
        # Columns might already exist
        pass

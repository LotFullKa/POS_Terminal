import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

# Определяем путь к БД в зависимости от окружения
if os.getenv("FLY_APP_NAME"):
    # В Fly.io используем постоянное хранилище
    DB_PATH = Path("/data/pos.sqlite")
else:
    # Локально используем домашнюю директорию
    APP_DIR = Path.home() / "AppData" / "Local" / "MyPOS"
    APP_DIR.mkdir(parents=True, exist_ok=True)
    DB_PATH = APP_DIR / "pos.sqlite"

# Создаём родительскую директорию если нужно
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Создаём таблицы при импорте
Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency для получения сессии БД"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

APP_DIR = Path.home() / "AppData" / "Local" / "MyPOS"
APP_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = APP_DIR / "pos.sqlite"
engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

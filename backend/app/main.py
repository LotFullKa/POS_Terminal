import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .api import router as api_router

app = FastAPI()
app.include_router(api_router, prefix="/api")


def get_dist_dir() -> Path:
    # В PyInstaller onefile файлы оказываются в sys._MEIPASS
    if getattr(sys, "_MEIPASS", None):
        return Path(sys._MEIPASS) / "app" / "dist"
    # В обычном запуске
    return Path(__file__).resolve().parent / "dist"


DIST_DIR = get_dist_dir()

# assets
assets_dir = DIST_DIR / "assets"
if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/{full_path:path}")
def spa(full_path: str):
    # чтобы "битые" /api/* не возвращали index.html
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")

    index = DIST_DIR / "index.html"
    if index.exists():
        return FileResponse(index)

    return {"error": "Frontend dist not found. Build React and place into app/dist."}

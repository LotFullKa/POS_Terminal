import sys
import os
import threading
import time
import webbrowser
import urllib.request

import uvicorn

# Для PyInstaller: добавляем путь к упакованным модулям
if getattr(sys, "frozen", False):
    # Если запущено из PyInstaller
    bundle_dir = sys._MEIPASS
    sys.path.insert(0, bundle_dir)
else:
    # Если запущено напрямую
    bundle_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, bundle_dir)

HOST = os.getenv("HOST", "0.0.0.0")  # 0.0.0.0 для облака, 127.0.0.1 для локального
PORT = int(os.getenv("PORT", "8080"))  # 8080 для Fly.io, 8000 для локального


def wait_until_ready(url: str, timeout_sec: float = 10.0) -> bool:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=0.5) as r:
                return 200 <= r.status < 500
        except Exception:
            time.sleep(0.2)
    return False


def run():
    # Импортируем app напрямую вместо строки
    from app.main import app as fastapi_app

    config = uvicorn.Config(
        fastapi_app,  # Передаём объект напрямую
        host=HOST,
        port=PORT,
        log_level="info",
    )
    server = uvicorn.Server(config)

    t = threading.Thread(target=server.run, daemon=True)
    t.start()

    # ждём, пока сервер поднимется
    health_url = f"http://{HOST}:{PORT}/api/health"
    if not wait_until_ready(health_url, timeout_sec=10):
        print("Server did not start in time.")
        return

    webbrowser.open(f"http://{HOST}:{PORT}/")

    try:
        # держим процесс живым
        while t.is_alive():
            time.sleep(0.5)
    except KeyboardInterrupt:
        server.should_exit = True
        t.join(timeout=5)


if __name__ == "__main__":
    run()

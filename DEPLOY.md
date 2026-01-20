# Деплой на VPS

## Быстрый старт

1. Склонируйте репозиторий на сервер:
```bash
git clone <your-repo-url>
cd CashMachine
```

2. Запустите:
```bash
docker-compose -f docker-compose.yml up -d
```

3. Откройте в браузере `http://your-server-ip`


## Обновление

```bash
git pull
docker-compose down
docker-compose up -d --build
```

## Бэкап данных

База данных хранится в Docker volume `app_data`.

Экспорт:
```bash
docker run --rm -v cashmachine_app_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .
```

Импорт:
```bash
docker run --rm -v cashmachine_app_data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /data
```

## Мониторинг

Логи приложения:
```bash
docker-compose logs -f app
```

Логи nginx:
```bash
docker-compose logs -f nginx
```

Статус:
```bash
docker-compose ps
```

## Firewall

Откройте порты:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## Автозапуск

Docker Compose автоматически перезапустит контейнеры при перезагрузке сервера (настройка `restart: unless-stopped`).

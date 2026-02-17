# Защищённое подключение (HTTPS) для эрмитаж-караоке.рф

Чтобы в браузере показывался замочек и «Защищено» вместо «Не защищено», сайт должен открываться по **HTTPS**. Это настраивается на **сервере** (ваш VPS Timeweb), а не в коде сайта.

## Что сделать на сервере

### 1. Подключиться по SSH

```bash
ssh root@62.113.41.14
```

(или ваш логин/хост из секретов GitHub.)

### 2. Установить Certbot (Let's Encrypt)

На Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### 3. Получить бесплатный SSL-сертификат

Certbot сам настроит nginx, если он уже обслуживает домен по HTTP:

```bash
sudo certbot --nginx -d эрмитаж-караоке.рф
```

Следуйте подсказкам: укажите email, согласитесь с условиями. Certbot выдаст сертификат и изменит конфиг nginx (добавит HTTPS и редирект с HTTP на HTTPS).

### 4. Проверить

- Откройте в браузере: **https://эрмитаж-караоке.рф**
- Должны быть замочек и надпись «Защищено».

### 5. Автопродление сертификата

Let's Encrypt выдаёт сертификат на 90 дней. Certbot добавляет задачу в cron/systemd, которая продлевает его автоматически. Проверить таймер:

```bash
sudo systemctl status certbot.timer
```

## Если nginx настроен вручную

Если вы правили конфиг nginx сами, пример блока для HTTPS:

```nginx
server {
    listen 80;
    server_name эрмитаж-караоке.рф;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name эрмитаж-караоке.рф;

    ssl_certificate     /etc/letsencrypt/live/эрмитаж-караоке.рф/fullchain.pem;
    ssl_certificate_key  /etc/letsencrypt/live/эрмитаж-караоке.рф/privkey.pem;

    root /var/www/ermitage;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Пути к сертификатам после `certbot` могут отличаться — посмотрите в конфигах, которые создал certbot.

## Важно

- Домен **эрмитаж-караоке.рф** должен указывать на IP вашего VPS (запись A в DNS).
- Порт 443 на сервере должен быть открыт (в панели Timeweb / файрволе).

После выполнения этих шагов подключение к сайту станет защищённым (HTTPS).

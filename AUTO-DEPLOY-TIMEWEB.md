# Автообновление: Cursor → GitHub → Timeweb (VPS)

Цель: ты меняешь файлы в Cursor, запускаешь одну команду, и сайт сам обновляется на Timeweb.

## 1) Один раз: настроить SSH-ключ для GitHub Actions

### 1.1 Создай ключ на своём Mac

В терминале (на Mac) выполни:

```bash
ssh-keygen -t ed25519 -C "github-deploy-ermitage" -f ~/.ssh/ermitage_deploy -N ""
```

После этого появятся 2 файла:
- `~/.ssh/ermitage_deploy` (PRIVATE key) — его добавим в GitHub Secrets
- `~/.ssh/ermitage_deploy.pub` (PUBLIC key) — его добавим на сервер в `authorized_keys`

### 1.2 Добавь PUBLIC key на сервер (в root)

Скопируй публичный ключ:

```bash
cat ~/.ssh/ermitage_deploy.pub
```

Зайди по SSH на сервер:

```bash
ssh root@62.113.41.14
```

И вставь (ОДНОЙ командой), заменив `PASTE_PUBLIC_KEY_HERE` на строку публичного ключа:

```bash
mkdir -p /root/.ssh && chmod 700 /root/.ssh && echo "PASTE_PUBLIC_KEY_HERE" >> /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys
```

### 1.3 Добавь PRIVATE key в GitHub Secrets

Открой репозиторий:
`https://github.com/YaroslavSigidin/ermitage`

Дальше:
**Settings → Secrets and variables → Actions → New repository secret**

Создай 4 секрета:
- `SSH_HOST` = `62.113.41.14`
- `SSH_USER` = `root`
- `SSH_PORT` = `22`
- `SSH_PRIVATE_KEY_B64` = приватный ключ в формате base64 (так в GitHub не ломаются переносы строк)

Как получить значение для `SSH_PRIVATE_KEY_B64` (в терминале на Mac):

```bash
cat ~/.ssh/ermitage_deploy | base64
```

Скопируй **весь** вывод одной строкой и вставь в секрет `SSH_PRIVATE_KEY_B64`. Старый секрет `SSH_PRIVATE_KEY` можно удалить — workflow его больше не использует.

## 2) Один раз: запушить обновлённый workflow

В терминале внутри проекта:

```bash
cd "/Users/sigidingo/Desktop/КУРСОР/restaurant-menu"
git add .github/workflows/deploy-timeweb.yml publish.sh AUTO-DEPLOY-TIMEWEB.md
git commit -m "Автодеплой на Timeweb через SSH"
git push
```

## 3) Каждый раз: публиковать изменения одной командой

В корне проекта:

```bash
cd "/Users/sigidingo/Desktop/КУРСОР/restaurant-menu"
bash publish.sh "Обновление меню"
```

После `git push` GitHub Actions автоматически зайдёт на сервер и обновит сайт в `/var/www/ermitage`.


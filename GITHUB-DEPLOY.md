# Пуш проекта на GitHub и связка с Timeweb

## Шаг 1. Залить проект в GitHub (один раз)

Открой **Терминал** в Cursor: меню **Terminal → New Terminal** (или нажми **Ctrl+`** / **Cmd+`**).

### Вариант «всё одной вставкой»

Скопируй весь блок ниже, вставь в терминал и нажми Enter. Команды выполнятся по порядку. Когда дойдёт до `git push`, возможно, попросят логин/пароль GitHub — см. ниже.

```bash
cd "/Users/sigidingo/Desktop/КУРСОР/restaurant-menu" && git init && git add . && git commit -m "Меню ресторана Эрмитаж" && git branch -M main && git remote add origin https://github.com/YaroslavSigidin/ermitage.git && git push -u origin main
```

### Вариант по одной команде

Если удобнее вводить по шагам:

```bash
cd "/Users/sigidingo/Desktop/КУРСОР/restaurant-menu"
```

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Меню ресторана Эрмитаж"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/YaroslavSigidin/ermitage.git
```

```bash
git push -u origin main
```

---

**Если при `git push` просят логин и пароль:**

- **Логин** — твой GitHub-логин (YaroslavSigidin).
- **Пароль** — не пароль от аккаунта, а **Personal Access Token**:
  1. Зайди на GitHub → Settings → Developer settings → Personal access tokens.
  2. Создай токен (Generate new token), отметь доступ **repo**.
  3. Скопируй токен и вставь его в терминал вместо пароля.

После успешного `git push` код будет в репозитории https://github.com/YaroslavSigidin/ermitage

---

## Шаг 2. Связь GitHub и Timeweb

Есть два варианта.

### Вариант A: Timeweb Cloud (App Platform)

Если у тебя **Timeweb Cloud** и раздел **«Приложения» / «App Platform»**:

1. Создай приложение → выбери **«Подключить репозиторий»**.
2. Подключи GitHub и выбери репозиторий **YaroslavSigidin/ermitage**.
3. Укажи, что это **статический сайт** (Static Site / только HTML/CSS/JS, без сборки).
4. Корень сайта — корень репозитория (где лежит `index.html`).
5. Сохрани. Деплой пойдёт автоматически; при каждом пуше в `main` сайт будет обновляться.

Подробнее: [Подключение репозиториев в Timeweb Cloud](https://timeweb.cloud/docs/apps/connecting-repositories).

### Вариант B: Обычный хостинг Timeweb (VPS/виртуальный хостинг)

Если сайт должен работать на твоём текущем сервере (IP 62.113.41.14):

1. На сервере должен быть установлен **Git**.
2. В панели Timeweb (или по SSH) настрой деплой так, чтобы при обновлении репозитория выполнялась команда вида:
   ```bash
   cd /public_html  # или твоя папка сайта
   git pull origin main
   ```
3. Автозапуск при пуше в GitHub можно сделать через **GitHub Actions** (скрипт будет по FTP/SFTP заливать файлы на хостинг) или через **webhook** на твоём сервере.

Если напишешь, какой у тебя тариф (облако или обычный хостинг), можно расписать точные шаги под твою панель.

---

## Дальше: как обновлять сайт

1. Меняешь файлы в Cursor.
2. В терминале:
   ```bash
   cd "/Users/sigidingo/Desktop/КУРСОР/restaurant-menu"
   git add .
   git commit -m "Обновление меню"
   git push
   ```
3. Если настроен автодеплой (App Platform или скрипт) — сайт обновится сам. Иначе один раз зайти на хостинг и сделать `git pull` (или залить файлы вручную).

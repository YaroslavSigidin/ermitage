#!/usr/bin/env bash
set -euo pipefail

# Скрипт автопубликации:
# следит за изменениями в файлах проекта и автоматически
# запускает publish.sh, который делает git add + commit + push.
#
# Использование:
#   1) Установи fswatch (один раз):
#      brew install fswatch
#   2) В корне проекта выполни:
#      bash auto-publish.sh
#   3) Оставь этот терминал открытым. При каждом сохранении файлов
#      изменения будут автоматически уходить на GitHub и на сервер (через GitHub Actions).

cd "$(dirname "$0")"

if ! command -v fswatch >/dev/null 2>&1; then
  echo "Для auto-publish нужен fswatch."
  echo "Установи его командой:"
  echo "  brew install fswatch"
  exit 1
fi

echo "Автопубликация запущена."
echo "Следим за изменениями в проекте и публикуем на GitHub при каждом сохранении."
echo "Чтобы остановить — нажми Ctrl+C."

# Наблюдаем за всем проектом, но игнорируем служебные каталоги.
fswatch -o \
  --exclude '\\.git/' \
  --exclude 'terminals/' \
  --exclude '\\.DS_Store' \
  . | while read -r _; do
    echo
    echo "Обнаружены изменения. Публикую..."
    # Сообщение коммита с датой и временем
    ./publish.sh "Автообновление $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Готово. Ждём следующих изменений..."
  done


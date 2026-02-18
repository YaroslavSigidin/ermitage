#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

git add -A

if git diff --cached --quiet; then
  echo "Нет изменений для публикации."
  exit 0
fi

MSG="${1:-Обновление сайта}"
git commit -m "$MSG"
git push

echo "Готово. GitHub Actions сам обновит Timeweb."


#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

VERSION="$(date -u +%Y%m%d%H)"
MENU_DATE="$(date -u +%d.%m.%Y)"

if [ -f index.html ]; then
  sed -i "s/deploy-version: [0-9]*/deploy-version: ${VERSION}/" index.html
  sed -i "s/menu-updated: [0-9-]*/menu-updated: $(date -u +%Y-%m-%d)/" index.html
  sed -i "s/Меню обновлено [0-9.]*/Меню обновлено ${MENU_DATE}/" index.html
  sed -i "s/?v=[0-9]*/?v=${VERSION}/g" index.html
fi

git add -A

if git diff --cached --quiet; then
  echo "Нет изменений для публикации."
  exit 0
fi

MSG="${1:-Обновление сайта}"
git commit -m "$MSG"
git push

echo "Готово. GitHub Actions сам обновит Timeweb."


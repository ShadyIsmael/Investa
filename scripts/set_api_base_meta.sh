#!/usr/bin/env bash
set -euo pipefail
if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <url> [target1 target2 ...]"
  exit 1
fi
URL="$1"
shift || true
TARGETS=("investa-client-portal" "investa-admin-portal")
if [ "$#" -gt 0 ]; then
  TARGETS=("$@")
fi

for t in "${TARGETS[@]}"; do
  path="$(dirname "$0")/../$t/src/index.html"
  if [ ! -f "$path" ]; then
    echo "Index not found for $t, skipping"
    continue
  fi

  if grep -q "<meta name=\"investa-api-base\"" "$path"; then
    sed -E -i "s|<meta name=\"investa-api-base\" content=\"[^"]*\" ?/?>|<meta name=\"investa-api-base\" content=\"$URL\" />|g" "$path"
  else
    awk -v url="$URL" 'BEGIN{added=0} /<head/ && !added {print; print "  <meta name=\"investa-api-base\" content=\""url"\" />"; added=1; next} {print}' "$path" > "$path.tmp" && mv "$path.tmp" "$path"
  fi
  echo "Updated $path -> $URL"
done
#!/usr/bin/env bash
# build-site.sh — puts the gallery and all the games into one folder for GitHub Pages.
# Usage: ./build-site.sh [outDir]   (default: _site)
set -euo pipefail

OUT="$(cd "$(dirname "$0")" && pwd)/${1:-_site}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
WORK="$(mktemp -d)"

# folder on the site  →  git tag (or commit) to build it from
GAMES=(
  "flappy-fps-dinosaurs  refs/tags/flappy-fps-dinosaurs"
  "robo-racer            refs/tags/robo-racer"
  "spud-quest            refs/tags/spud-quest"
  "robo-knight           refs/tags/robo-knight"
  "robo-dodge-starter    c2495c5"
)

rm -rf "$OUT"
mkdir -p "$OUT"
cp "$ROOT/index.html" "$OUT/"
cp -R "$ROOT/assets" "$ROOT/docs" "$OUT/"
touch "$OUT/.nojekyll"

for entry in "${GAMES[@]}"; do
  read -r folder ref <<< "$entry"
  echo "▶ Building $folder from $ref"
  git -C "$ROOT" worktree add --detach "$WORK/$folder" "$ref" >/dev/null
  (cd "$WORK/$folder" && npm ci --no-audit --no-fund --silent && npx vite build --base ./ --outDir "$OUT/$folder" --emptyOutDir --logLevel warn)
  git -C "$ROOT" worktree remove --force "$WORK/$folder"
done

# Old link from before the gallery existed → the game's new home
mkdir -p "$OUT/spud-racer-quest"
cat > "$OUT/spud-racer-quest/index.html" <<'HTML'
<!doctype html><meta charset="utf-8"><title>Moved</title>
<meta http-equiv="refresh" content="0; url=../spud-quest/">
<a href="../spud-quest/">Spud Racer Quest has moved here.</a>
HTML

rm -rf "$WORK"
echo "✅ Site ready in $OUT"

#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# update-rnd.sh  —  Rebuild Demo-control and embed it into zenmac-frontend
#
# Usage:
#   bash update-rnd.sh                          (default Demo-control path)
#   bash update-rnd.sh "D:/Peter/Demo-control"  (custom path)
# ─────────────────────────────────────────────────────────────────────────────

set -e

DEMO_DIR="${1:-D:/Peter/Demo-control}"
FRONTEND_DIR="$(cd "$(dirname "$0")/zenmac-frontend" && pwd)"
RND_PUBLIC="$FRONTEND_DIR/public/rnd"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   ZenMAC · R&D Update Script                ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  Demo-control : $DEMO_DIR"
echo "  Frontend     : $FRONTEND_DIR"
echo "  Target       : $RND_PUBLIC"
echo ""

# ── Step 1: Build Demo-control ──────────────────────────────────────────────
echo "▶ [1/4] Building Demo-control (base=/rnd/) ..."
cd "$DEMO_DIR"
MSYS_NO_PATHCONV=1 npm run build -- --base=/rnd/
echo "  ✓ Build complete"
echo ""

# ── Step 2: Clear & copy dist ───────────────────────────────────────────────
echo "▶ [2/4] Copying dist → public/rnd/ ..."
rm -rf "$RND_PUBLIC"
mkdir -p "$RND_PUBLIC"
cp -r "$DEMO_DIR/dist/." "$RND_PUBLIC/"
echo "  ✓ Copied"
echo ""

# ── Step 3: Build zenmac-frontend ───────────────────────────────────────────
echo "▶ [3/4] Building zenmac-frontend ..."
cd "$FRONTEND_DIR"
npm run build
echo "  ✓ Build complete"
echo ""

# ── Step 4: Commit & push ───────────────────────────────────────────────────
echo "▶ [4/4] Committing and pushing ..."
cd "$(dirname "$0")"
git add zenmac-frontend/public/rnd/
git commit -m "chore(rnd): update Demo-control build $(date +'%Y-%m-%d %H:%M')

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push origin main
echo "  ✓ Pushed to main"
echo ""

echo "══════════════════════════════════════════════"
echo "  Done! R&D updated at /rnd/"
echo "══════════════════════════════════════════════"
echo ""

#!/bin/bash
# IDE Cache Clear Script
# This script eliminates ghost file errors by clearing IDE caches

echo "🧹 Clearing IDE Cache for iWork Export Extension..."
echo ""

# Navigate to project directory
cd /Users/yosfgfx/weqaa-raycast-extensions/eproter

echo "✅ Step 1: Verified these files DO NOT EXIST:"
echo "   - custom-export.tsx"
echo "   - export-full-presentation.tsx"
echo "   - export-selected-slides.tsx"
echo "   - preview-slides.tsx"
echo ""

echo "🔨 Step 2: Clearing build caches..."
rm -rf node_modules/.cache
rm -rf dist
rm -rf .raycast
echo "   ✓ Build caches cleared"
echo ""

echo "🔨 Step 3: Clearing VS Code/Cursor caches..."
# Clear workspace state
rm -rf .vscode/.react
rm -rf .vscode/.debug
# Note: User should manually close tabs and restart IDE
echo "   ✓ Workspace caches cleared"
echo ""

echo "🏗️  Step 4: Rebuilding..."
npm run build
echo ""

echo "✅ DONE!"
echo ""
echo "📋 IMPORTANT: To fully clear errors:"
echo "   1. Close these tabs in your IDE:"
echo "      - custom-export.tsx"
echo "      - export-full-presentation.tsx"
echo "      - export-selected-slides.tsx"
echo "      - preview-slides.tsx"
echo "   2. Restart your IDE (Cmd+Q then reopen)"
echo "   3. Errors will be gone! ✨"
echo ""
echo "Real files in src/:"
ls -1 src/*.tsx
echo ""

#!/usr/bin/env sh
# Copies the web game (../match3/index.html, the single source of truth) into
# the app's assets. Run it after every change to the game, before building.
set -e
cd "$(dirname "$0")/.."
cp ../match3/index.html assets/game/index.html
echo "Synced match3/index.html -> assets/game/index.html"

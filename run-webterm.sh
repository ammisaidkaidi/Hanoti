#!/usr/bin/env bash
# Start webterm, repairing anything a sandbox reset removed.
#
# Why this exists: workspace snapshots exclude node_modules/ (and any dir
# literally named .venv), so both the installed package and its private
# virtualenv disappear between sessions. This script reinstalls what is
# missing and then starts the server against a venv that DOES persist
# (/home/user/webterm-env), so restarts stay fast.
set -euo pipefail

APP_DIR="/home/user/.built-in"
PKG="$APP_DIR/node_modules/@qcompanyofai/webterm"
VENV="$APP_DIR/pyenv"   # NOT inside node_modules: that dir is wiped on reset
PORT="${PORT:-7681}"

# 1. npm package (wiped by every sandbox reset)
if [ ! -f "$PKG/server.py" ]; then
  echo "run-webterm: installing @qcompanyofai/webterm"
  cd "$APP_DIR" && npm install --silent
fi

# 2. persistent virtualenv (not under node_modules, so it survives)
if [ ! -x "$VENV/bin/python" ]; then
  echo "run-webterm: creating persistent virtualenv at $VENV"
  python3 -m venv "$VENV"
fi
if [ ! -f "$VENV/.requirements-installed" ]; then
  echo "run-webterm: installing Python dependencies"
  "$VENV/bin/python" -m pip install --quiet --disable-pip-version-check \
    -r "$PKG/requirements.txt"
  date -u +%Y-%m-%dT%H:%M:%SZ > "$VENV/.requirements-installed"
fi

# 3. hand over to the package's own launcher, pointed at the persistent venv
export WEBTERM_VENV="$VENV"
cd "$APP_DIR"
exec node "$PKG/bin/webterm.js" --host 0.0.0.0 --port "$PORT" "$@"

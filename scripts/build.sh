#!/usr/bin/env bash
# @kolang/interpreter — build script for kolang.wasm from the Kolang interpreter repo
#
# This script compiles the Kolang interpreter's Go code (cmd/wasm/main.go)
# for the js/wasm target and places the output, together with the
# wasm_exec.js support file, in the root of this repository.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
# Location of the Kolang interpreter repo — a sibling folder of this repo
KOLANG_REPO="$REPO_DIR/../kolang"

if ! command -v go >/dev/null 2>&1; then
  echo "Error: Go is not installed on this system." >&2
  echo "Install Go to build: https://go.dev/dl/" >&2
  exit 1
fi

if [ ! -f "$KOLANG_REPO/cmd/wasm/main.go" ]; then
  echo "Error: Kolang interpreter repo not found." >&2
  echo "Expected the following file to exist:" >&2
  echo "  $KOLANG_REPO/cmd/wasm/main.go" >&2
  echo "Place the Kolang repo as a sibling folder (../kolang)." >&2
  exit 1
fi

OUT_WASM="$REPO_DIR/kolang.wasm"
TMP_WASM="$REPO_DIR/.kolang-wasm.tmp"

echo "Building kolang.wasm from the Kolang interpreter repo ($KOLANG_REPO) …"
# Build inside the Kolang repo so module dependencies (go.mod) resolve correctly.
(
  cd "$KOLANG_REPO"
  GOOS=js GOARCH=wasm go build -o "$TMP_WASM" ./cmd/wasm
)
mv "$TMP_WASM" "$OUT_WASM"

WASM_EXEC="$(go env GOROOT)/lib/wasm/wasm_exec.js"
if [ ! -f "$WASM_EXEC" ]; then
  echo "Error: wasm_exec.js support file not found in Go: $WASM_EXEC" >&2
  exit 1
fi
cp "$WASM_EXEC" "$REPO_DIR/wasm_exec.js"

echo "✓ Build complete:"
echo "  $OUT_WASM"
echo "  $REPO_DIR/wasm_exec.js"

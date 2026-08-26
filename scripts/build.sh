#!/usr/bin/env bash
# @kolang/interpreter — اسکریپت ساخت kolang.wasm از مخزن مفسر کلنگ
#
# این اسکریپت کد Go مفسر کلنگ (cmd/wasm/main.go) را برای هدف
# js/wasm کامپایل می‌کند و خروجی را همراه با فایل پشتیبان
# wasm_exec.js در ریشهٔ همین مخزن قرار می‌دهد.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
# محل مخزن مفسر کلنگ — پوشهٔ همسایهٔ این مخزن
KOLANG_REPO="$REPO_DIR/../kolang"

if ! command -v go >/dev/null 2>&1; then
  echo "خطا: ابزار Go روی سیستم نصب نیست." >&2
  echo "برای ساخت باید Go را نصب کنید: https://go.dev/dl/" >&2
  exit 1
fi

if [ ! -f "$KOLANG_REPO/cmd/wasm/main.go" ]; then
  echo "خطا: مخزن مفسر کلنگ یافت نشد." >&2
  echo "انتظار می‌رفت فایل زیر وجود داشته باشد:" >&2
  echo "  $KOLANG_REPO/cmd/wasm/main.go" >&2
  echo "مخزن کلنگ را به‌عنوان پوشهٔ همسایه (../kolang) قرار دهید." >&2
  exit 1
fi

OUT_WASM="$REPO_DIR/kolang.wasm"
TMP_WASM="$REPO_DIR/.kolang-wasm.tmp"

echo "در حال ساخت kolang.wasm از مخزن مفسر کلنگ ($KOLANG_REPO) …"
# ساخت داخل مخزن کلنگ انجام می‌شود تا وابستگی‌های ماژول (go.mod) درست حل شوند.
(
  cd "$KOLANG_REPO"
  GOOS=js GOARCH=wasm go build -o "$TMP_WASM" ./cmd/wasm
)
mv "$TMP_WASM" "$OUT_WASM"

WASM_EXEC="$(go env GOROOT)/lib/wasm/wasm_exec.js"
if [ ! -f "$WASM_EXEC" ]; then
  echo "خطا: فایل پشتیبان wasm_exec.js در Go یافت نشد: $WASM_EXEC" >&2
  exit 1
fi
cp "$WASM_EXEC" "$REPO_DIR/wasm_exec.js"

echo "✓ ساخت کامل شد:"
echo "  $OUT_WASM"
echo "  $REPO_DIR/wasm_exec.js"
# @kolang/interpreter

مفسر کلنگ کامپایل‌شده به WebAssembly برای اجرای کلنگ در مرورگر و Node.js.

با این بسته می‌توانید کد کلنگ را مستقیماً در جاوااسکریپت اجرا کنید — بدون نیاز به سرور و بدون نصب ابزار Go.

نسخه: **۰.۰.۱** — مجوز: **MIT**

## نصب

```bash
npm install @kolang/interpreter
```

## استفاده

ابتدا مفسر را بارگذاری کنید، سپس کد را اجرا کنید:

```js
import { runKolang, loadWasm } from '@kolang/interpreter'

await loadWasm()

const { ok, output, error } = await runKolang('«سلام دنیا!» بنویس')
console.log(output) // سلام دنیا!
```

در Node.js (CommonJS):

```js
const { runKolang, loadWasm } = require('@kolang/interpreter')

loadWasm().then(async () => {
  const result = await runKolang('مجموع = ۱ + ۲\nمجموع بنویس')
  console.log(result.output) // ۳
})
```

قرارداد خروجی `runKolang(code)`:

```ts
Promise<{ ok: boolean; output: string; error: string }>
```

- `ok` — آیا اجرا بدون خطا انجام شد؟
- `output` — خروجی برنامه (پس از `بنویس` و مانند آن).
- `error` — پیام خطا (در صورت وجود).

## توسعه

ساخت بسته به «Go» و مخزن مفسر کلنگ در پوشهٔ همسایه نیاز دارد:

```bash
npm run build
```

اسکریپت `scripts/build.sh`:

۱. مخزن کلنگ را در `../kolang` پیدا می‌کند و از وجود `cmd/wasm/main.go` مطمئن می‌شود.
۲. داخل مخزن کلنگ، دستور `GOOS=js GOARCH=wasm go build ./cmd/wasm` را اجرا می‌کند.
۳. خروجی `kolang.wasm` و فایل پشتیبان `wasm_exec.js` را به ریشهٔ همین مخزن کپی می‌کند.

پیش از انتشار، `prepublishOnly` به‌صورت خودکار همین ساخت را انجام می‌دهد.

## معماری

```
┌─────────────────────────────┐
│   @kolang/interpreter (این)  │  ساخت + انتشار WASM
└─────────────┬───────────────┘
              │ go build (js/wasm)
┌─────────────▼───────────────┐
│   kolang (مخزن مفسر)         │  cmd/wasm/main.go ← منبع مفسر
└─────────────────────────────┘
```

این مخزن **فقط** عملیات ساخت و انتشار بستهٔ WASM را انجام می‌دهد؛ منبع مفسر در مخزن
[kolang](https://github.com/faralidev/kolang) است و هرگز از این مخزن تغییر نمی‌کند.
پلی‌گراند موجود در `docs/` مخزن kolang نیز با همین فایل‌های ساخته‌شده کار می‌کند.

## مشارکت

راهنمای مشارکت را در [CONTRIBUTING.md](./CONTRIBUTING.md) ببینید.

---

## English

**@kolang/interpreter** — the Kolang interpreter compiled to WebAssembly, published as an npm package. Run Kolang code directly from JavaScript in the browser or Node.js, with no server or Go toolchain required.

- **Install:** `npm install @kolang/interpreter`
- **Usage:** `await loadWasm()` then `await runKolang(code)` → `{ ok, output, error }`
- **Build:** `npm run build` (requires Go and the `kolang` repo at `../kolang`; `prepublishOnly` rebuilds automatically).
- **Architecture:** this repo only builds and publishes the WASM bundle; the interpreter source lives in the [kolang](https://github.com/faralidev/kolang) repo.
- **License:** MIT — © 2026 FaraliDev and contributors.
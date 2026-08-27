// @kolang/interpreter — اجرای کد کلنگ در مرورگر با WebAssembly
//
// راه‌اندازی:
//   import { runKolang, loadWasm } from '@kolang/interpreter'
//   await loadWasm()
//   const { ok, output, error } = await runKolang('«سلام» بنویس')
//
// قرارداد خروجی (از cmd/wasm/main.go در مخزن کلنگ):
//   runKolang(code) -> Promise<{ ok: boolean, output: string, error: string }>

// توجه: import های «node:fs» و «node:url» عمداً در سطح بالا نیستند؛ آن‌ها به‌صورت
// پویا و فقط داخل شاخهٔ Node تابع loadWasm بارگذاری می‌شوند تا در مرورگر/Vite
// (که import.meta.url با http است) خطای ERR_UNSUPPORTED_ESM_URL_SCHEME رخ ندهد.
// فایل پشتیبان wasm_exec.js اسکریپتی ساده است (بدون import/export) که رابط
// اجرای Go — کلاس Go — را روی globalThis تعریف می‌کند؛ همین‌جا با یک import
// (بارگذاری کناری) اجرا می‌شود تا loadWasm همیشه Go را در دسترس داشته باشد.
import './wasm_exec.js'

// مسیر فایل kolang.wasm در هر دو محیط Node و مرورگر:
//   - Node:    fileURLToPath(wasmUrl) برای خواندن باینری با fs (داخل loadWasm)
//   - مرورگر:  fetch(wasmUrl) که به آدرس مطلق همین ماژول حل می‌شود
const wasmUrl = new URL('./kolang.wasm', import.meta.url)

let loaded = false
let loadPromise = null

// Go class (رابط اجرای Go در WASM) از فایل پشتیبان wasm_exec.js می‌آید که
// در ابتدای همین ماژول بارگذاری شده است؛ اینجا فقط وجودش را بررسی می‌کنیم.
function ensureGo() {
  return typeof globalThis.Go === 'function'
}

export function loadWasm() {
  if (loaded) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = (async function () {
    if (!ensureGo()) {
      return Promise.reject(new Error('wasm_exec.js بارگذاری نشد — پیش از loadWasm() آن را در صفحه اضافه کنید'))
    }

    const go = new globalThis.Go()
    const isNode = typeof process !== 'undefined' &&
      process.versions && typeof process.versions.node === 'string'

    let instantiate
    if (isNode) {
      // Node.js: خواندن باینری با fs — import های node: فقط همین‌جا و به‌صورت
      // پویا بارگذاری می‌شوند تا در سطح ماژول، مرورگر را نشکنند.
      const { readFileSync } = await import('node:fs')
      const { fileURLToPath } = await import('node:url')
      const wasmPath = fileURLToPath(wasmUrl)
      const bytes = readFileSync(wasmPath)
      instantiate = WebAssembly.instantiate(bytes, go.importObject)
    } else {
      // مرورگر: ابتدا جریان‌یابی (نیازمند MIME صحیح)، در غیر این‌صورت
      // بارگذاری با fetch + arrayBuffer (مثل docs/playground.js).
      const doStream = () =>
        WebAssembly.instantiateStreaming(fetch(wasmUrl), go.importObject)
      const doFallback = () =>
        fetch(wasmUrl)
          .then((r) => r.arrayBuffer())
          .then((bytes) => WebAssembly.instantiate(bytes, go.importObject))
      instantiate = typeof WebAssembly.instantiateStreaming === 'function'
        ? doStream().catch(doFallback)
        : doFallback()
    }

    return instantiate.then(({ instance }) => {
      // go.run مفسر را اجرا می‌کند. برنامهٔ Go برای همیشه روی select{}
      // منتظر می‌ماند؛ پس این Promise هرگز پایان نمی‌یابد و نباید await شود.
      // تا این لحظه تابع runKolang روی globalThis ثبت شده است.
      go.run(instance)
      loaded = true
    })
  })()

  return loadPromise
}

export function runKolang(code) {
  if (typeof globalThis.runKolang === 'function') {
    return globalThis.runKolang(code)
  }
  return Promise.reject(new Error('WASM بارگذاری نشده — ابتدا loadWasm() را صدا بزنید'))
}
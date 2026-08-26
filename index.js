// @kolang/interpreter — اجرای کد کلنگ در مرورگر با WebAssembly
//
// راه‌اندازی:
//   import { runKolang, loadWasm } from '@kolang/interpreter'
//   await loadWasm()
//   const { ok, output, error } = await runKolang('«سلام» بنویس')
//
// قرارداد خروجی (از cmd/wasm/main.go در مخزن کلنگ):
//   runKolang(code) -> Promise<{ ok: boolean, output: string, error: string }>

'use strict'

const path = require('path')

const wasmPath = path.join(__dirname, 'kolang.wasm')

let loaded = false
let loadPromise = null

// Go class (رابط اجرای Go در WASM) از فایل پشتیبان wasm_exec.js می‌آید.
// اگر هنوز بارگذاری نشده، همین فایل را درون‌بسته (require) می‌کنیم.
function ensureGo() {
  if (typeof globalThis.Go === 'undefined') {
    try {
      require('./wasm_exec.js')
    } catch (e) {
      // در مرورگر ممکن است فایل جداگانه بارگذاری شود؛ اینجا فقط رد می‌کنیم.
    }
  }
  return typeof globalThis.Go === 'function'
}

function loadWasm() {
  if (loaded) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = (function () {
    if (!ensureGo()) {
      return Promise.reject(new Error('wasm_exec.js بارگذاری نشد — پیش از loadWasm() آن را در صفحه اضافه کنید'))
    }

    const go = new globalThis.Go()
    const isNode = typeof process !== 'undefined' &&
      process.versions && typeof process.versions.node === 'string'

    let instantiate
    if (isNode) {
      // Node.js: خواندن باینری با fs
      const fs = require('fs')
      const bytes = fs.readFileSync(wasmPath)
      instantiate = WebAssembly.instantiate(bytes, go.importObject)
    } else {
      // مرورگر: ابتدا جریان‌یابی (نیازمند MIME صحیح)، در غیر این‌صورت
      // بارگذاری با fetch + arrayBuffer (مثل docs/playground.js).
      const doStream = () =>
        WebAssembly.instantiateStreaming(fetch(wasmPath), go.importObject)
      const doFallback = () =>
        fetch(wasmPath)
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

function runKolang(code) {
  if (typeof globalThis.runKolang === 'function') {
    return globalThis.runKolang(code)
  }
  return Promise.reject(new Error('WASM بارگذاری نشده — ابتدا loadWasm() را صدا بزنید'))
}

module.exports = { loadWasm, runKolang }
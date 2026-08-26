/**
 * مفسر کلنگ کامپایل‌شده به WebAssembly — اجرای کد کلنگ در مرورگر
 *
 * راه‌اندازی:
 *   import { runKolang, loadWasm } from '@kolang/interpreter'
 *   await loadWasm()
 *   const { ok, output, error } = await runKolang('«سلام» بنویس')
 */

/**
 * بارگذاری و آماده‌سازی مفسر WASM.
 * قبل از اولین صدا زدن runKolang باید این تابع را await کنید.
 */
export function loadWasm(): Promise<void>

/**
 * اجرای کد کلنگ.
 * خروجی یک وعده است که به { ok, output, error } حل می‌شود.
 */
export function runKolang(code: string): Promise<{ ok: boolean; output: string; error: string }>
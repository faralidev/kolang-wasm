# مشارکت در مخزن ساخت WASM

این مخزن فقط عملیات ساخت و انتشار بستهٔ npm مفسر کلنگ به WebAssembly را انجام می‌دهد.
منبع خود مفسر در مخزن «kolang» نگهداری می‌شود و در این مخزن تغییر نمی‌کند.

## چه چیزی اینجا نیست؟

- کد منبع مفسر کلنگ (Go) — در مخزن [kolang](https://github.com/faralidev/kolang) است.
- منطق و رابط کاربری پلی‌گراند — در پوشهٔ `docs/` مخزن kolang است.

## چه چیزی اینجاست؟

- `scripts/build.sh` — ساخت `kolang.wasm` و `wasm_exec.js` از مخزن kolang همسایه.
- `index.js` و `index.d.ts` — رابط برنامه‌نویسی بسته: `loadWasm()` و `runKolang(code)`.

## تغییرات

برای تغییر رفتار مفسر (زبان کلنگ)، در مخزن kolang مشارکت کنید.
در این مخزن فقط چیزهایی را تغییر دهید که به ساخت و بسته‌بندی WASM مربوط است:
- اسکریپت ساخت (`scripts/build.sh`)
- رابط برنامه‌نویسی بسته (`index.js`، `index.d.ts`)
- مستندات و متادیتای بسته

## ساخت و آزمایش

```bash
npm run build
node -e "const { loadWasm, runKolang } = require('./'); loadWasm().then(() => runKolang('«سلام» بنویس')).then(r => console.log(r.output))"
```

نکته: ساخت نیاز به «Go» و وجود مخزن kolang در پوشهٔ همسایه (`../kolang`) دارد.

## انتشار

- نسخه را در `package.json` افزایش دهید.
- سپس: `npm publish --access public`
- پیش از انتشار، اسکریپت `prepublishOnly` به‌صورت خودکار `npm run build` را اجرا می‌کند.

پیش از ثبت تغییرات (commit)، از درستی فارسی (نیم‌فاصله، ارقام فارسی) در متن‌ها مطمئن شوید.
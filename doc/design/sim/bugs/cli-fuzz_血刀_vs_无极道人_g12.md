# Bug: Game 12 (血刀_vs_无极道人)

**Time:** 2026-05-24T17:34:12.240Z

**Bugs:**
- [INIT_CRASH] init failed code=1

**Last actions:**

**Stderr:**
```
D:\jianghuCCG\sim\src\engine\cardRegistry.js:24
    throw new Error('Card not found: ' + id);
    ^

Error: Card not found: undefined
    at Object.getCard (D:\jianghuCCG\sim\src\engine\cardRegistry.js:24:11)
    at D:\jianghuCCG\sim\src\engine\gameState.js:39:19
    at Array.map (<anonymous>)
    at createPlayerState (D:\jianghuCCG\sim\src\engine\gameState.js:38:37)
    at Object.createGameState (D:\jianghuCCG\sim\src\engine\gameState.js:9:7)
    at Object.<anonymous> (D:\jianghuCCG\sim\src\interact3.js:939:18)
    at Module._compile (node:internal/modules/cjs/loader:1730:14)
    at Object..js (node:internal/modules/cjs/loader:1895:10)
    at Module.load (node:internal/modules/cjs/loader:1465:32)
    at Function._load (node:internal/modules/cjs/loader:1282:12)

Node.js v22.16.0

```

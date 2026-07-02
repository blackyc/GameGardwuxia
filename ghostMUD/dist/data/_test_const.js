// Test: const in <script> can be referenced by later code in same script
const FOO = { bar: 42 };
window.__DATA = window.__DATA || {};
window.__DATA.FOO = FOO;
console.log('Test:', window.__DATA.FOO.bar);

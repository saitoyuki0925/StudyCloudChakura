import '@testing-library/jest-dom';

// dotenvの設定
require('dotenv').config();

if (typeof global.structuredClone !== 'function') {
  const polyfill = require('@ungap/structured-clone');
  global.structuredClone = polyfill.default ?? polyfill;
}

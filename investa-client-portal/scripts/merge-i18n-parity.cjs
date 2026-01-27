const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'src', 'assets', 'i18n', 'en.json');
const arPath = path.join(__dirname, '..', 'src', 'assets', 'i18n', 'ar.json');
if (!fs.existsSync(enPath) || !fs.existsSync(arPath)) {
  console.error('en.json or ar.json missing'); process.exit(2);
}
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

function flatten(obj, prefix = '') {
  let res = [];
  for (const k of Object.keys(obj)) {
    const val = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      res = res.concat(flatten(val, key));
    } else {
      res.push(key);
    }
  }
  return res;
}

function setByPath(obj, pathStr, value) {
  const parts = pathStr.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (i === parts.length - 1) {
      cur[p] = value;
    } else {
      if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {};
      cur = cur[p];
    }
  }
}

const enKeys = new Set(flatten(en));
const arKeys = new Set(flatten(ar));
const unionKeys = new Set([...enKeys, ...arKeys]);

for (const k of unionKeys) {
  const enHas = enKeys.has(k);
  const arHas = arKeys.has(k);
  if (!enHas && arHas) {
    // copy from ar to en
    const val = getByPath(ar, k);
    setByPath(en, k, val);
  }
  if (!arHas && enHas) {
    const val = getByPath(en, k);
    setByPath(ar, k, val); // fallback to English until translated
  }
}

function getByPath(obj, pathStr) {
  const parts = pathStr.split('.');
  let cur = obj;
  for (const p of parts) {
    if (!cur) return undefined;
    cur = cur[p];
  }
  return cur;
}

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
console.log('Merged i18n parity: en and ar now have the same key set');

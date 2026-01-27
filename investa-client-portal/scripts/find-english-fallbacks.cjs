const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'src', 'assets', 'i18n', 'en.json');
const arPath = path.join(__dirname, '..', 'src', 'assets', 'i18n', 'ar.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

function flatten(obj, prefix = '') {
  let res = {};
  for (const k of Object.keys(obj)) {
    const val = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(res, flatten(val, key));
    } else {
      res[key] = val;
    }
  }
  return res;
}

const enFlat = flatten(en);
const arFlat = flatten(ar);

const suspicious = [];
for (const k of Object.keys(enFlat)) {
  const enVal = enFlat[k];
  const arVal = arFlat[k];
  if (!arVal) {
    suspicious.push({ key: k, en: enVal, ar: arVal, reason: 'missing' });
    continue;
  }
  // detect if arVal seems English (has ASCII letters and non-trivial ascii content)
  const asciiLetters = (arVal.match(/[A-Za-z]/g) || []).length;
  const asciiRatio = asciiLetters / (arVal.length || 1);
  if (asciiLetters >= 4 || asciiRatio > 0.05) {
    const identical = String(arVal).trim() === String(enVal).trim();
    suspicious.push({ key: k, en: enVal, ar: arVal, reason: identical ? 'identical' : `ascii:${asciiLetters}` });
  }
}

console.log(JSON.stringify(suspicious, null, 2));

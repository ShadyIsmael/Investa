const fs = require('fs');
const path = require('path');

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

const enPath = path.join(__dirname, '..', 'src', 'assets', 'i18n', 'en.json');
const arPath = path.join(__dirname, '..', 'src', 'assets', 'i18n', 'ar.json');

if (!fs.existsSync(enPath) || !fs.existsSync(arPath)) {
  console.error('en.json or ar.json missing');
  process.exit(2);
}

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

const enKeys = new Set(flatten(en));
const arKeys = new Set(flatten(ar));

const missingInAr = [...enKeys].filter(k => !arKeys.has(k));
const missingInEn = [...arKeys].filter(k => !enKeys.has(k));

console.log('Total EN keys:', enKeys.size);
console.log('Total AR keys:', arKeys.size);
console.log('Missing in AR:', missingInAr.length);
console.log('Missing in EN:', missingInEn.length);
if (missingInAr.length) console.log('Missing in AR (sample 50):', missingInAr.slice(0,50));
if (missingInEn.length) console.log('Missing in EN (sample 50):', missingInEn.slice(0,50));

if (missingInAr.length || missingInEn.length) process.exit(1);
console.log('Key parity OK');

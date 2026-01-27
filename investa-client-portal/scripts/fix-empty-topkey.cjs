const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'src', 'assets', 'i18n', 'en.json');
const arPath = path.join(__dirname, '..', 'src', 'assets', 'i18n', 'ar.json');
if (!fs.existsSync(enPath) || !fs.existsSync(arPath)) {
  console.error('Missing en.json or ar.json'); process.exit(2);
}
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

function suggestKey(obj) {
  const keys = Object.keys(obj);
  if (keys.includes('incoming') || keys.includes('outgoing')) return 'requests';
  if (keys.includes('startInvestingButton') || keys.includes('riskLevel')) return 'investments';
  if (keys.includes('backButton') && keys.includes('fundingStatus')) return 'investmentPreview';
  if (keys.includes('title_part1') || keys.includes('getStartedButton')) return 'hero';
  if (keys.includes('title') && keys.includes('subtitle') && keys.includes('button')) return 'cta';
  // fallback
  return null;
}

let changed = false;
if (Object.prototype.hasOwnProperty.call(en, '')) {
  const suggested = suggestKey(en['']);
  if (suggested && !en[suggested]) {
    en[suggested] = en['']; delete en['']; changed = true; console.log('Moved en[""] -> en["'+suggested+'"]');
  }
}
if (Object.prototype.hasOwnProperty.call(ar, '')) {
  const suggested = suggestKey(ar['']);
  if (suggested && !ar[suggested]) {
    ar[suggested] = ar['']; delete ar['']; changed = true; console.log('Moved ar[""] -> ar["'+suggested+'"]');
  }
}

if (changed) {
  fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
  fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
  console.log('Fixed empty top-level keys and wrote files.');
} else {
  console.log('No empty top-level keys found or no suggestions apply.');
}

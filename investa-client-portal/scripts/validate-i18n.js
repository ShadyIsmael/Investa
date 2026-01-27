const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', 'src', 'assets', 'i18n', 'en.json'),
  path.join(__dirname, '..', 'src', 'assets', 'i18n', 'ar.json')
];

let ok = true;
for (const f of files) {
  if (!fs.existsSync(f)) {
    console.error('Missing i18n file:', f);
    ok = false;
    continue;
  }
  const buf = fs.readFileSync(f);
  const s = buf.toString('utf8');
  const reBuf = Buffer.from(s, 'utf8');
  if (!reBuf.equals(buf)) {
    console.error('File is not valid UTF-8:', f);
    ok = false;
  }
  try {
    JSON.parse(s);
  } catch (err) {
    console.error('Invalid JSON in', f, '-', err.message);
    ok = false;
  }
}
if (!ok) process.exit(2);
console.log('i18n validation passed');

const fs = require('fs');
const p = 'd:/projects/Investa/gitInvesta/investa-client-portal/src/app/services/language.service.ts';
let s = fs.readFileSync(p, 'utf8');
const start = s.indexOf('\n  ar: {');
if (start === -1) { console.error('start not found'); process.exit(1); }
const endMarker = '\ntype Language';
const end = s.indexOf(endMarker, start);
if (end === -1) { console.error('end not found'); process.exit(1); }
const before = s.slice(0, start+1);
const after = s.slice(end+1);
const replacement = "  ar: { language: { toggle: 'English' } },";
fs.writeFileSync(p, before + replacement + '\n' + after, 'utf8');
console.log('Replaced ar block');

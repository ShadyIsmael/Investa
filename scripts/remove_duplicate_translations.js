const fs = require('fs');
const p = 'd:/projects/Investa/gitInvesta/investa-client-portal/src/app/services/language.service.ts';
let s = fs.readFileSync(p,'utf8');
const first = s.indexOf('const TRANSLATIONS = {');
const second = s.indexOf('const TRANSLATIONS = {', first+1);
if(second === -1){ console.log('no duplicate found'); process.exit(0);} 
const newContent = s.slice(0, second);
fs.writeFileSync(p, newContent, 'utf8');
console.log('Removed duplicate TRANSLATIONS starting at', second);
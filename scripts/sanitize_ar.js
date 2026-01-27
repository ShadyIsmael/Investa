const fs = require('fs');
const p = 'd:/projects/Investa/gitInvesta/investa-client-portal/src/app/services/language.service.ts';
let s = fs.readFileSync(p, 'utf8');
const start = s.indexOf('\n  ar: {');
if (start === -1) { console.error('ar start not found'); process.exit(1); }
let i = start + 1; // at start of line
let depth = 0;
// find position of matching closing brace for the ar object
for (; i < s.length; i++){
  if (s[i] === '{') depth++;
  else if (s[i] === '}') {
    depth--;
    if (depth === 0) { // found closing brace of ar
      // after this brace there may be a comma
      let end = i+1;
      // include following comma if present
      while (s[end] && (s[end] === ' ' || s[end] === '\r' || s[end] === '\n' || s[end] === ',')) end++;
      const before = s.slice(0, start+1);
      const after = s.slice(end);
      const replacement = "  ar: { language: { toggle: 'English' } },";
      fs.writeFileSync(p, before + replacement + '\n' + after, 'utf8');
      console.log('Replaced ar block');
      process.exit(0);
    }
  }
}
console.error('matching closing brace not found'); process.exit(1);

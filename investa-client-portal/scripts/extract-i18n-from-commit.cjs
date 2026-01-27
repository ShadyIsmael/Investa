const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error('Usage: node extract-i18n-from-commit.cjs <commit-hash>');
  process.exit(2);
}
const commit = process.argv[2];
const candidatePaths = ['src/app/services/language.service.ts', 'investa-client-portal/src/app/services/language.service.ts'];
let filePath = null;
for (const p of candidatePaths) {
  try {
    execSync(`git cat-file -e ${commit}:${p}`, { stdio: 'ignore' });
    filePath = p;
    break;
  } catch (err) {
    // continue
  }
}
if (!filePath) {
  // fallback to first candidate
  filePath = candidatePaths[1];
}

function extractBlock(content, key) {
  const start = content.indexOf(key + ':');
  if (start === -1) return null;
  let i = content.indexOf('{', start);
  if (i === -1) return null;
  let depth = 0;
  let end = -1;
  for (; i < content.length; i++) {
    const ch = content[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) return null;
  return content.slice(content.indexOf('{', start), end + 1);
}

function parseTsObjectLiteral(objText) {
  // A simple stateful parser that converts object literal text to a JS object
  let i = 0;
  function skipWhitespace() {
    while (i < objText.length && /[\s,]/.test(objText[i])) i++;
  }

  function parseString() {
    skipWhitespace();
    const quote = objText[i];
    if (quote !== '"' && quote !== "'") return null;
    i++;
    let out = '';
    while (i < objText.length) {
      const ch = objText[i];
      if (ch === '\\') {
        const next = objText[i + 1];
        if (next === 'n') { out += '\n'; i += 2; continue; }
        out += next; i += 2; continue;
      }
      if (ch === quote) { i++; break; }
      out += ch; i++;
    }
    // Normalize whitespace inside strings
    out = out.replace(/\s+/g, ' ').trim();
    return out;
  }

  function parseKey() {
    skipWhitespace();
    // key may be identifier or quoted
    if (objText[i] === '"' || objText[i] === "'") {
      return parseString();
    }
    // identifier
    let start = i;
    while (i < objText.length && /[A-Za-z0-9_\-]/.test(objText[i])) i++;
    return objText.slice(start, i).trim();
  }

  function parseValue() {
    skipWhitespace();
    if (objText[i] === '{') return parseObject();
    if (objText[i] === '"' || objText[i] === "'") return parseString();
    if (objText[i] === '[') return parseArray();
    // else, parse until comma or closing brace
    let start = i;
    while (i < objText.length && !/[,}]/.test(objText[i])) i++;
    return objText.slice(start, i).trim();
  }

  function parseArray() {
    // assume array of strings or objects
    const arr = [];
    i++; // skip [
    while (i < objText.length) {
      skipWhitespace();
      if (objText[i] === ']') { i++; break; }
      const val = parseValue();
      if (val !== undefined) arr.push(val);
      skipWhitespace(); if (objText[i] === ',') { i++; continue; }
    }
    return arr;
  }

  function parseObject() {
    const out = {};
    i++; // skip {
    while (i < objText.length) {
      skipWhitespace();
      if (objText[i] === '}') { i++; break; }
      const key = parseKey();
      skipWhitespace();
      if (objText[i] === ':') i++; else {
        // malformed maybe due to stray characters
        // try to skip until ':'
        while (i < objText.length && objText[i] !== ':') i++;
        if (objText[i] === ':') i++;
      }
      const val = parseValue();
      out[key] = val;
      skipWhitespace();
      if (objText[i] === ',') { i++; continue; }
    }
    return out;
  }

  // strip leading/trailing braces if present
  const start = objText.indexOf('{');
  const end = objText.lastIndexOf('}');
  const body = objText.slice(start, end + 1);
  i = 0;
  objText = body;
  const res = parseObject();
  return res;
}

try {
  const raw = execSync(`git show ${commit}:${filePath}`, { encoding: 'utf8' });
  const enBlock = extractBlock(raw, '  en') || extractBlock(raw, 'en') || extractBlock(raw, '\nen');
  const arBlock = extractBlock(raw, '  ar') || extractBlock(raw, 'ar') || extractBlock(raw, '\nar');
  if (!enBlock || !arBlock) {
    console.error('Could not locate en or ar blocks in file at commit', commit);
    process.exit(2);
  }

  const enObj = parseTsObjectLiteral(enBlock);
  const arObj = parseTsObjectLiteral(arBlock);

  const outDir = path.join(__dirname, '..', 'src', 'assets', 'i18n');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'en.json'), JSON.stringify(enObj, null, 2), { encoding: 'utf8' });
  fs.writeFileSync(path.join(outDir, 'ar.json'), JSON.stringify(arObj, null, 2), { encoding: 'utf8' });

  console.log('Extracted en.json and ar.json from commit', commit);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(2);
}

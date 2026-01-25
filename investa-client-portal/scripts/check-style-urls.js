#!/usr/bin/env node
import { glob } from 'glob';
import fs from 'fs';

(async () => {
  const files = await glob('src/app/**/*.component.ts', { nodir: true });
  const missing = [];

  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    // skip pure re-exports (allow leading comments/whitespace)
    if (/export\s*\{[^}]*\}/.test(content) && !/@Component\s*\(/.test(content)) continue;
    // check for styleUrls or styles property inside @Component decorator
    const hasStyle = /styleUrls\s*:\s*\[|styles\s*:\s*\[|styles\s*:\s*`/.test(content);
    if (!hasStyle) missing.push(f);
  }

  if (missing.length > 0) {
    console.error('\nMissing style definitions (styleUrls or styles) in the following components:\n');
    missing.forEach(m => console.error(' - ' + m));
    console.error('\nPlease add a minimal scss file or `styles: []` to the component decorator.\n');
    process.exit(1);
  }

  console.log('All components have style metadata (styleUrls or styles).');
  process.exit(0);
})();
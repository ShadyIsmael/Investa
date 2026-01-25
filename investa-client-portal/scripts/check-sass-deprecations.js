#!/usr/bin/env node
import { glob } from 'glob';
import fs from 'fs';

(async () => {
  const files = await glob('src/**/*.scss', { nodir: true });
  const findings = [];

  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    if (/@import\s+['\"](variables|mixins|typography|utilities)['\"]/g.test(content)) {
      findings.push({ file: f, reason: 'Uses deprecated @import of shared SCSS' });
    }
    if (/darken\(/g.test(content)) {
      findings.push({ file: f, reason: 'Uses deprecated darken() function' });
    }
  }

  if (findings.length > 0) {
    console.error('\nSass deprecation issues found:\n');
    findings.forEach(f => console.error(` - ${f.file}: ${f.reason}`));
    console.error('\nRun the automated migration or fix files to use @use and color.adjust().\n');
    process.exit(1);
  }

  console.log('No Sass deprecation patterns found.');
  process.exit(0);
})();
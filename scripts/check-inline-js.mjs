import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const filename = process.argv[2] || 'index.html';
const html = fs.readFileSync(filename, 'utf8');
const matches = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
const scripts = matches.filter((m) => !/\bsrc\s*=/.test(m[1]) && m[2].trim().length > 0);
if (!scripts.length) {
  console.error('No inline JavaScript found');
  process.exit(1);
}
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'warrock-check-'));
try {
  for (let i = 0; i < scripts.length; i++) {
    const tmp = path.join(dir, `script-${i}.js`);
    fs.writeFileSync(tmp, scripts[i][2], 'utf8');
    const result = spawnSync(process.execPath, ['--check', tmp], { encoding: 'utf8' });
    if (result.status !== 0) {
      console.error(`Inline script ${i + 1} syntax FAIL:`, result.stderr);
      process.exit(1);
    }
  }
  console.log(`PASS: ${scripts.length} inline JavaScript block(s) parse correctly (${filename})`);
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

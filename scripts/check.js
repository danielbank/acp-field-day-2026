// check.js — quick sanity check: both builds must succeed and the offline file must be self-contained.
// Usage: npm run check   (exits with an error if anything is wrong)

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

function fail(message) {
  console.error(`\n❌❌❌  CHECK FAILED: ${message}\n`);
  process.exit(1);
}

function run(command) {
  console.log(`\n▶ ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch {
    fail(`"${command}" did not succeed. Read the error above, fix it (or git revert), and try again.`);
  }
}

run('npx vite build');
if (!existsSync('dist/index.html')) fail('dist/index.html was not created.');

run('npx vite build --mode offline');
const offlineFile = 'dist-offline/game.html';
if (!existsSync(offlineFile)) fail(`${offlineFile} was not created.`);
const html = readFileSync(offlineFile, 'utf8');
const externalRefs = html.match(/(src|href)\s*=\s*["'](?!data:|#)[^"']+["']/g);
if (externalRefs) fail(`${offlineFile} loads outside files, so it won't work offline: ${externalRefs.join(', ')}`);
if (/https?:\/\/(?!www\.w3\.org)/.test(html)) fail(`${offlineFile} mentions a web address. The game must not use the network.`);

console.log('\n✅  All good! Both builds work and game.html is fully offline.\n');

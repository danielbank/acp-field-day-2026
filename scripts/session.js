// session.js — start a new class session branch from main.
// Usage: npm run session -- 6th-period   →   creates and switches to session/YYYY-MM-DD-6th-period

import { execSync } from 'node:child_process';

const git = (args) => execSync(`git ${args}`, { encoding: 'utf8' }).trim();
function stop(message) {
  console.error(`\n✋ ${message}\n`);
  process.exit(1);
}

const rawName = process.argv[2];
if (!rawName) stop('Please give the session a name, like:  npm run session -- 6th-period');
const name = rawName.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
if (!name) stop(`"${rawName}" doesn't work as a branch name. Try letters, numbers and dashes.`);

try { git('rev-parse --verify main'); } catch { stop('There is no "main" branch with a commit yet. Make the initial commit first.'); }
if (git('status --porcelain')) stop('You have uncommitted changes. Commit or stash them first (git status shows them).');

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const branch = `session/${date}-${name}`;

if (git(`branch --list ${branch}`)) stop(`Branch ${branch} already exists. Pick a different name.`);

git('checkout main');
git(`checkout -b ${branch}`);
console.log(`\n🚀 Ready! You're on ${branch} (started from main). Run "npm run dev" and have fun.\n`);

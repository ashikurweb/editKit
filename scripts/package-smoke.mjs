import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);

const publicPackageFiles = [
  '../package.json',
  '../packages/core/package.json',
  '../packages/ui/package.json',
  '../packages/react/package.json',
  '../packages/vue/package.json',
  '../packages/svelte/package.json',
];

const publicPackages = await Promise.all(
  publicPackageFiles.map(async file => JSON.parse(await readFile(new URL(file, import.meta.url), 'utf8'))),
);
const publicVersions = new Set(publicPackages.map(pkg => pkg.version));
assert.equal(
  publicVersions.size,
  1,
  `Public package versions must match: ${publicPackages.map(pkg => `${pkg.name}@${pkg.version}`).join(', ')}`,
);

const entries = [
  { esm: '../dist/index.js', cjs: '../dist/index.cjs', exports: ['EditKitEditor', 'createEditKit', 'createToolbar', 'BubbleMenu'] },
  { esm: '../dist/react.js', cjs: '../dist/react.cjs', exports: ['EditKitEditor', 'useEditKitEditor'] },
  { esm: '../dist/vue.js', cjs: '../dist/vue.cjs', exports: ['EditKitEditor', 'useEditKitEditor'] },
  { esm: '../dist/svelte.js', cjs: '../dist/svelte.cjs', exports: ['editkit'] },
];

for (const entry of entries) {
  const esm = await import(new URL(entry.esm, import.meta.url));
  const cjs = require(entry.cjs);
  for (const exportName of entry.exports) {
    assert.ok(exportName in esm, `${entry.esm} is missing ${exportName}`);
    assert.ok(exportName in cjs, `${entry.cjs} is missing ${exportName}`);
  }
}

const reactEntry = await readFile(new URL('../dist/react.js', import.meta.url), 'utf8');
assert.match(reactEntry, /^['"]use client['"];?/);

for (const file of [
  '../src/styles.css',
  '../types/styles.d.ts',
  '../packages/ui/src/styles/editor.css',
  '../packages/ui/src/styles/editor.d.ts',
]) {
  await readFile(new URL(file, import.meta.url), 'utf8');
}

console.log(`Package smoke checks passed for v${publicPackages[0].version}, ESM, CommonJS, framework entries, and styles.`);

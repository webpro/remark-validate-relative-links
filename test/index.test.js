import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { remark } from 'remark';
import plugin from '../index.js';

const fixturesUrl = new URL('./fixtures/', import.meta.url);
const fixturesDir = fileURLToPath(fixturesUrl);

async function loadFixture(name) {
  return readFile(new URL(name, fixturesUrl), 'utf8');
}

async function runMarkdown(cwd, filePath, value) {
  const processor = remark().use(plugin);
  const file = await processor.process({ cwd, path: filePath, value });
  return file.messages;
}

test('remark-validate-relative-links', async () => {
  const value = await loadFixture('readme.md');
  const messages = await runMarkdown(fixturesDir, 'readme.md', value);

  assert.equal(messages.length, 4);
  assert.ok(messages.every(m => m.source === 'remark-validate-relative-links'));

  const missingFiles = messages.filter(m => m.ruleId === 'missing-file');
  assert.equal(missingFiles.length, 1);
  assert.ok(
    messages.some(m => m.reason.includes('Cannot find file `./missing.md`'))
  );

  const missingHeadings = messages.filter(m => m.ruleId === 'missing-heading');
  assert.equal(missingHeadings.length, 3);
  assert.ok(
    messages.some(m =>
      m.reason.includes('Cannot find heading `#bravo` in this file')
    )
  );
  assert.ok(
    messages.some(m =>
      m.reason.includes('Cannot find heading `#missing` in `./target.md`')
    )
  );
  assert.ok(
    messages.some(m =>
      m.reason.includes('Cannot find heading `#missing` in `./doc.md`')
    )
  );
});

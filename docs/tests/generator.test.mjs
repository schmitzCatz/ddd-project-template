import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { generate, slug } from '../scripts/generate.mjs';

test('slug conversion', () => assert.equal(slug('Customer Management'), 'customer-management'));

test('domain generation preserves template and replaces placeholders', async () => {
    const root = await mkdtemp(path.join(tmpdir(),'ddd-'));
    await mkdir(path.join(root,'templates/domain'),{recursive:true});
    await writeFile(path.join(root,'templates/domain/entity.adoc'),'= {{name}}\nContext: {{context}}\n== Rules\nKeep this section.');
    const p = await generate(['domain','entity','Customer','--context','Customer Context'],root);
    assert.match(await readFile(p,'utf8'),/= Customer\nContext: Customer Context\n== Rules/);
    await assert.rejects(generate(['domain','entity','Customer'],root),{code:'EEXIST'});
});
test('domain generation preserves template and replaces placeholders (uppercase)', async () => {
    const root = await mkdtemp(path.join(tmpdir(),'ddd-'));
    await mkdir(path.join(root,'templates/domain'),{recursive:true});
    await writeFile(path.join(root,'templates/domain/entity.adoc'),'= {{name}}\nContext: {{context}}\n== Rules\nKeep this section.');
})
test('ADR numbering increments', async () => {
    const root = await mkdtemp(path.join(tmpdir(),'ddd-'));
    await mkdir(path.join(root,'templates/architecture'),{recursive:true});
    await writeFile(path.join(root,'templates/architecture/adr.adoc'),'= {{number}} - {{title}}');
    const a = await generate(['architecture','adr','Use PostgreSQL'],root);
    const b = await generate(['architecture','adr','Use Redis'],root);
    assert.equal(path.basename(a),'0001-use-postgresql.adoc');
    assert.equal(path.basename(b),'0002-use-redis.adoc');
});

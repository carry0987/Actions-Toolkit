import { describe, expect, it } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Cache } from '@/cache';
import { Util } from '@/util';

const fixturesDir = path.join(__dirname, '.fixtures');
const tmpDir = fs.mkdtempSync(path.join(process.env.TEMP || os.tmpdir(), 'cache-itg-'));

describe('cache', () => {
    it('caches github-repo', async () => {
        const r = Util.generateRandomString();
        const htcName = `cache-test-github-repo-${r}`;
        const c = new Cache({
            htcName: htcName,
            htcVersion: `v1.0.0+${r}`,
            baseCacheDir: path.join(tmpDir, '.cache-test'),
            cacheFile: 'github-repo.json'
        });
        expect(await c.save(path.join(fixturesDir, 'github-repo.json'), true)).not.toEqual('');
        expect(await c.find()).not.toEqual('');
    });

    it('caches github-repo with post state', async () => {
        const r = Util.generateRandomString();
        const htcName = `cache-test-github-repo-${r}`;
        const c = new Cache({
            htcName: htcName,
            htcVersion: `v1.0.0+${r}`,
            baseCacheDir: path.join(tmpDir, '.cache-test'),
            cacheFile: 'github-repo.json'
        });
        expect(await c.save(path.join(fixturesDir, 'github-repo.json'))).not.toEqual('');
        expect(await Cache.post()).not.toBeNull();
        expect(await c.find()).not.toEqual('');
    });
});

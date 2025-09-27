import { describe, expect, vi, it, afterEach, beforeEach, test } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import * as rimraf from 'rimraf';

import { Context } from '@/context';

const tmpDir = fs.mkdtempSync(path.join(process.env.TEMP || os.tmpdir(), 'context-'));
const tmpName = path.join(tmpDir, '.tmpname-jest');

vi.spyOn(Context, 'tmpDir').mockImplementation((): string => {
    fs.mkdirSync(tmpDir, { recursive: true });
    return tmpDir;
});

vi.spyOn(Context, 'tmpName').mockImplementation((): string => {
    return tmpName;
});

afterEach(() => {
    rimraf.sync(tmpDir);
});

describe('parseGitRef', () => {
    const originalEnv = process.env;
    beforeEach(() => {
        vi.resetModules();
        process.env = {
            ...originalEnv,
            DOCKER_GIT_CONTEXT_PR_HEAD_REF: ''
        };
    });
    afterEach(() => {
        process.env = originalEnv;
    });
    test.each([
        [
            'refs/heads/master',
            '860c1904a1ce19322e91ac35af1ab07466440c37',
            false,
            '860c1904a1ce19322e91ac35af1ab07466440c37'
        ],
        ['master', '860c1904a1ce19322e91ac35af1ab07466440c37', false, '860c1904a1ce19322e91ac35af1ab07466440c37'],
        ['refs/pull/15/merge', '860c1904a1ce19322e91ac35af1ab07466440c37', false, 'refs/pull/15/merge'],
        ['refs/heads/master', '', false, 'refs/heads/master'],
        ['master', '', false, 'master'],
        ['refs/tags/v1.0.0', '', false, 'refs/tags/v1.0.0'],
        ['refs/pull/15/merge', '', false, 'refs/pull/15/merge'],
        ['refs/pull/15/merge', '', true, 'refs/pull/15/head']
    ])('given %p and %p, should return %p', async (ref: string, sha: string, prHeadRef: boolean, expected: string) => {
        process.env.DOCKER_DEFAULT_GIT_CONTEXT_PR_HEAD_REF = prHeadRef ? 'true' : '';
        expect(Context.parseGitRef(ref, sha)).toEqual(expected);
    });
});

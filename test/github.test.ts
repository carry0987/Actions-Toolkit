import { describe, expect, vi, it, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as core from '@actions/core';
import { GitHub } from '@/github';
import { GitHubRepo } from '@/types/github';
import repoFixture from './.fixtures/github-repo.json';

vi.spyOn(GitHub.prototype, 'repoData').mockImplementation((): Promise<GitHubRepo> => {
    return <Promise<GitHubRepo>>(repoFixture as unknown);
});

describe('repoData', () => {
    it('returns GitHub repo data', async () => {
        const github = new GitHub();
        expect((await github.repoData()).name).toEqual('Hello-World');
    });
});

describe('serverURL', () => {
    const originalEnv = process.env;
    beforeEach(() => {
        vi.resetModules();
        process.env = {
            ...originalEnv,
            GITHUB_SERVER_URL: 'https://foo.github.com'
        };
    });
    afterEach(() => {
        process.env = originalEnv;
    });
    it('returns default', async () => {
        process.env.GITHUB_SERVER_URL = '';
        expect(GitHub.serverURL).toEqual('https://github.com');
    });
    it('returns from env', async () => {
        expect(GitHub.serverURL).toEqual('https://foo.github.com');
    });
});

describe('apiURL', () => {
    const originalEnv = process.env;
    beforeEach(() => {
        vi.resetModules();
        process.env = {
            ...originalEnv,
            GITHUB_API_URL: 'https://bar.github.com'
        };
    });
    afterEach(() => {
        process.env = originalEnv;
    });
    it('returns default', async () => {
        process.env.GITHUB_API_URL = '';
        expect(GitHub.apiURL).toEqual('https://api.github.com');
    });
    it('returns from env', async () => {
        expect(GitHub.apiURL).toEqual('https://bar.github.com');
    });
});

describe('repository', () => {
    it('returns GitHub repository', async () => {
        expect(GitHub.repository).toEqual('carry0987/actions-toolkit');
    });
});

describe('workflowRunURL', () => {
    it('returns 2188748038', async () => {
        expect(GitHub.workflowRunURL()).toEqual('https://github.com/carry0987/actions-toolkit/actions/runs/2188748038');
    });
    it('returns 2188748038 with attempts 2', async () => {
        expect(GitHub.workflowRunURL(true)).toEqual(
            'https://github.com/carry0987/actions-toolkit/actions/runs/2188748038/attempts/2'
        );
    });
});

describe('actionsRuntimeToken', () => {
    const originalEnv = process.env;
    beforeEach(() => {
        vi.resetModules();
        process.env = {
            ...originalEnv
        };
    });
    afterEach(() => {
        process.env = originalEnv;
    });
    it('empty', async () => {
        process.env.ACTIONS_RUNTIME_TOKEN = '';
        expect(GitHub.actionsRuntimeToken).toBeUndefined();
    });
    it('malformed', async () => {
        process.env.ACTIONS_RUNTIME_TOKEN = 'foo';
        expect(() => {
            GitHub.actionsRuntimeToken;
        }).toThrow();
    });
    it('fixture', async () => {
        process.env.ACTIONS_RUNTIME_TOKEN = fs
            .readFileSync(path.join(__dirname, '.fixtures', 'runtimeToken.txt'))
            .toString()
            .trim();
        const runtimeToken = GitHub.actionsRuntimeToken;
        expect(runtimeToken?.ac).toEqual('[{"Scope":"refs/heads/master","Permission":3}]');
        expect(runtimeToken?.iss).toEqual('vstoken.actions.githubusercontent.com');
    });
});

describe('printActionsRuntimeTokenACs', () => {
    const originalEnv = process.env;
    beforeEach(() => {
        vi.resetModules();
        process.env = {
            ...originalEnv
        };
    });
    afterEach(() => {
        process.env = originalEnv;
    });
    it('empty', async () => {
        process.env.ACTIONS_RUNTIME_TOKEN = '';
        await expect(GitHub.printActionsRuntimeTokenACs()).rejects.toThrow(new Error('ACTIONS_RUNTIME_TOKEN not set'));
    });
    it('malformed', async () => {
        process.env.ACTIONS_RUNTIME_TOKEN = 'foo';
        await expect(GitHub.printActionsRuntimeTokenACs()).rejects.toThrow(
            new Error('Cannot parse GitHub Actions Runtime Token: Invalid token specified: missing part #2')
        );
    });
    it('refs/heads/master', async () => {
        const infoSpy = vi.spyOn(core, 'info');
        process.env.ACTIONS_RUNTIME_TOKEN = fs
            .readFileSync(path.join(__dirname, '.fixtures', 'runtimeToken.txt'))
            .toString()
            .trim();
        await GitHub.printActionsRuntimeTokenACs();
        expect(infoSpy).toHaveBeenCalledTimes(1);
        expect(infoSpy).toHaveBeenCalledWith(`refs/heads/master: read/write`);
    });
});

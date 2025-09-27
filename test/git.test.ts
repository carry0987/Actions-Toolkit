import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Git } from '@/git';
import { Exec } from '@/exec';
import { ExecOutput } from '@actions/exec';

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('context', () => {
    it('returns mocked ref and sha', async () => {
        vi.spyOn(Exec, 'getExecOutput').mockImplementation((cmd, args): Promise<ExecOutput> => {
            const fullCmd = `${cmd} ${args?.join(' ')}`;
            let result = '';
            switch (fullCmd) {
                case 'git show --format=%H HEAD --quiet --':
                    result = 'test-sha';
                    break;
                case 'git branch --show-current':
                    result = 'test';
                    break;
                case 'git symbolic-ref HEAD':
                    result = 'refs/heads/test';
                    break;
            }
            return Promise.resolve({
                stdout: result,
                stderr: '',
                exitCode: 0
            });
        });
        const ctx = await Git.context();
        expect(ctx.ref).toEqual('refs/heads/test');
        expect(ctx.sha).toEqual('test-sha');
    });
});

describe('isInsideWorkTree', () => {
    it('have been called', async () => {
        const execSpy = vi.spyOn(Exec, 'getExecOutput');
        try {
            await Git.isInsideWorkTree();
        } catch (err) {
            // noop
        }
        expect(execSpy).toHaveBeenCalledWith(`git`, ['rev-parse', '--is-inside-work-tree'], {
            silent: true,
            ignoreReturnCode: true
        });
    });
});

describe('remoteSha', () => {
    it('returns sha using git ls-remote', async () => {
        expect(await Git.remoteSha('https://github.com/docker/buildx.git', 'refs/pull/648/head')).toEqual(
            'f11797113e5a9b86bd976329c5dbb8a8bfdfadfa'
        );
    });
    it('returns sha using github api', async () => {
        expect(
            await Git.remoteSha('https://github.com/docker/buildx.git', 'refs/pull/648/head', process.env.GITHUB_TOKEN)
        ).toEqual('f11797113e5a9b86bd976329c5dbb8a8bfdfadfa');
    });
});

describe('remoteURL', () => {
    it('have been called', async () => {
        const execSpy = vi.spyOn(Exec, 'getExecOutput');
        try {
            await Git.remoteURL();
        } catch (err) {
            // noop
        }
        expect(execSpy).toHaveBeenCalledWith(`git`, ['remote', 'get-url', 'origin'], {
            silent: true,
            ignoreReturnCode: true
        });
    });
});

describe('ref', () => {
    it('returns mocked ref', async () => {
        vi.spyOn(Exec, 'getExecOutput').mockImplementation((cmd, args): Promise<ExecOutput> => {
            const fullCmd = `${cmd} ${args?.join(' ')}`;
            let result = '';
            switch (fullCmd) {
                case 'git branch --show-current':
                    result = 'test';
                    break;
                case 'git symbolic-ref HEAD':
                    result = 'refs/heads/test';
                    break;
            }
            return Promise.resolve({
                stdout: result,
                stderr: '',
                exitCode: 0
            });
        });

        const ref = await Git.ref();

        expect(ref).toEqual('refs/heads/test');
    });

    it('returns mocked detached tag ref', async () => {
        vi.spyOn(Exec, 'getExecOutput').mockImplementation((cmd, args): Promise<ExecOutput> => {
            const fullCmd = `${cmd} ${args?.join(' ')}`;
            let result = '';
            switch (fullCmd) {
                case 'git branch --show-current':
                    result = '';
                    break;
                case 'git show -s --pretty=%D':
                    result = 'HEAD, tag: 8.0.0';
                    break;
            }
            return Promise.resolve({
                stdout: result,
                stderr: '',
                exitCode: 0
            });
        });

        const ref = await Git.ref();

        expect(ref).toEqual('refs/tags/8.0.0');
    });

    it('returns mocked detached tag ref (shallow clone)', async () => {
        vi.spyOn(Exec, 'getExecOutput').mockImplementation((cmd, args): Promise<ExecOutput> => {
            const fullCmd = `${cmd} ${args?.join(' ')}`;
            let result = '';
            switch (fullCmd) {
                case 'git branch --show-current':
                    result = '';
                    break;
                case 'git show -s --pretty=%D':
                    result = 'grafted, HEAD, tag: 8.0.0';
                    break;
            }
            return Promise.resolve({
                stdout: result,
                stderr: '',
                exitCode: 0
            });
        });

        const ref = await Git.ref();

        expect(ref).toEqual('refs/tags/8.0.0');
    });

    it('returns mocked detached pull request merge ref (shallow clone)', async () => {
        vi.spyOn(Exec, 'getExecOutput').mockImplementation((cmd, args): Promise<ExecOutput> => {
            const fullCmd = `${cmd} ${args?.join(' ')}`;
            let result = '';
            switch (fullCmd) {
                case 'git branch --show-current':
                    result = '';
                    break;
                case 'git show -s --pretty=%D':
                    result = 'grafted, HEAD, pull/221/merge';
                    break;
            }
            return Promise.resolve({
                stdout: result,
                stderr: '',
                exitCode: 0
            });
        });

        const ref = await Git.ref();

        expect(ref).toEqual('refs/pull/221/merge');
    });

    it('should throws an error when detached HEAD ref is not supported', async () => {
        vi.spyOn(Exec, 'getExecOutput').mockImplementation((cmd, args): Promise<ExecOutput> => {
            const fullCmd = `${cmd} ${args?.join(' ')}`;
            let result = '';
            switch (fullCmd) {
                case 'git branch --show-current':
                    result = '';
                    break;
                case 'git show -s --pretty=%D':
                    result = 'wrong, HEAD, tag: 8.0.0';
                    break;
            }
            return Promise.resolve({
                stdout: result,
                stderr: '',
                exitCode: 0
            });
        });

        await expect(Git.ref()).rejects.toThrow('Cannot find detached HEAD ref in "wrong, HEAD, tag: 8.0.0"');
    });

    it('returns mocked detached branch ref', async () => {
        vi.spyOn(Exec, 'getExecOutput').mockImplementation((cmd, args): Promise<ExecOutput> => {
            const fullCmd = `${cmd} ${args?.join(' ')}`;
            let result = '';
            switch (fullCmd) {
                case 'git branch --show-current':
                    result = '';
                    break;
                case 'git show -s --pretty=%D':
                    result = 'HEAD, origin/test, test';
                    break;
            }
            return Promise.resolve({
                stdout: result,
                stderr: '',
                exitCode: 0
            });
        });

        const ref = await Git.ref();

        expect(ref).toEqual('refs/heads/test');
    });
});

describe('fullCommit', () => {
    it('have been called', async () => {
        const execSpy = vi.spyOn(Exec, 'getExecOutput');
        try {
            await Git.fullCommit();
        } catch (err) {
            // noop
        }
        expect(execSpy).toHaveBeenCalledWith(`git`, ['show', '--format=%H', 'HEAD', '--quiet', '--'], {
            silent: true,
            ignoreReturnCode: true
        });
    });
});

describe('shortCommit', () => {
    it('have been called', async () => {
        const execSpy = vi.spyOn(Exec, 'getExecOutput');
        try {
            await Git.shortCommit();
        } catch (err) {
            // noop
        }
        expect(execSpy).toHaveBeenCalledWith(`git`, ['show', '--format=%h', 'HEAD', '--quiet', '--'], {
            silent: true,
            ignoreReturnCode: true
        });
    });
});

describe('tag', () => {
    it('have been called', async () => {
        const execSpy = vi.spyOn(Exec, 'getExecOutput');
        try {
            await Git.tag();
        } catch (err) {
            // noop
        }
        expect(execSpy).toHaveBeenCalledWith(`git`, ['tag', '--points-at', 'HEAD', '--sort', '-version:creatordate'], {
            silent: true,
            ignoreReturnCode: true
        });
    });
});

describe('getCommitDate', () => {
    it('head', async () => {
        const date = await Git.commitDate('HEAD');
        await expect(date).toBeInstanceOf(Date);
    });
});

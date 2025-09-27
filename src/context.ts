import { GitHub } from '@/github';
import { mkdtempSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { tmpNameSync, type TmpNameOptions } from 'tmp';
import * as github from '@actions/github';

export class Context {
    private static readonly _tmpDir = mkdtempSync(
        join(Context.ensureDirExists(process.env.RUNNER_TEMP || tmpdir()), 'actions-toolkit-')
    );

    private static ensureDirExists(dir: string): string {
        mkdirSync(dir, { recursive: true });

        return dir;
    }

    public static tmpDir(): string {
        return Context._tmpDir;
    }

    public static tmpName(options?: TmpNameOptions): string {
        return tmpNameSync(options);
    }

    public static gitRef(): string {
        return Context.parseGitRef(github.context.ref, github.context.sha);
    }

    public static parseGitRef(ref: string, sha: string): string {
        const setPullRequestHeadRef: boolean = !!(
            process.env.DOCKER_DEFAULT_GIT_CONTEXT_PR_HEAD_REF &&
            process.env.DOCKER_DEFAULT_GIT_CONTEXT_PR_HEAD_REF === 'true'
        );
        if (sha && ref && !ref.startsWith('refs/')) {
            ref = `refs/heads/${ref}`;
        }
        if (sha && !ref.startsWith(`refs/pull/`)) {
            ref = sha;
        } else if (ref && ref.startsWith(`refs/pull/`) && setPullRequestHeadRef) {
            ref = ref.replace(/\/merge$/g, '/head');
        }

        return ref;
    }

    public static gitContext(): string {
        return `${GitHub.serverURL}/${github.context.repo.owner}/${github.context.repo.repo}.git#${Context.gitRef()}`;
    }
}

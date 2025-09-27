import { GitHubOpts } from '@/interfaces/github';
import {
    GitHubActionsRuntimeToken,
    GitHubActionsRuntimeTokenAC,
    GitHubRepo,
} from '@/types/github';
import { isGhes } from '@actions/artifact/lib/internal/shared/config';
import { info } from '@actions/core';
import * as github from '@actions/github';
import { GitHub as Octokit } from '@actions/github/lib/utils';
import { Context } from '@actions/github/lib/context';
import { jwtDecode, JwtPayload } from 'jwt-decode';

export class GitHub {
    public readonly octokit: InstanceType<typeof Octokit>;

    constructor(opts?: GitHubOpts) {
        this.octokit = github.getOctokit(`${opts?.token}`);
    }

    public async repoData(): Promise<GitHubRepo> {
        return this.octokit.rest.repos.get({ ...github.context.repo }).then((response) => response.data as GitHubRepo);
    }

    static get context(): Context {
        return github.context;
    }

    static get serverURL(): string {
        return process.env.GITHUB_SERVER_URL || 'https://github.com';
    }

    static get apiURL(): string {
        return process.env.GITHUB_API_URL || 'https://api.github.com';
    }

    static get isGHES(): boolean {
        return isGhes();
    }

    static get repository(): string {
        return `${github.context.repo.owner}/${github.context.repo.repo}`;
    }

    static get workspace(): string {
        return process.env.GITHUB_WORKSPACE || process.cwd();
    }

    static get runId(): number {
        return process.env.GITHUB_RUN_ID ? +process.env.GITHUB_RUN_ID : github.context.runId;
    }

    static get runAttempt(): number {
        return process.env.GITHUB_RUN_ATTEMPT ? +process.env.GITHUB_RUN_ATTEMPT : 1;
    }

    static get actionsRuntimeToken(): GitHubActionsRuntimeToken | undefined {
        const token = process.env['ACTIONS_RUNTIME_TOKEN'] || '';

        return token ? (jwtDecode<JwtPayload>(token) as GitHubActionsRuntimeToken) : undefined;
    }

    public static workflowRunURL(setAttempts?: boolean): string {
        return `${GitHub.serverURL}/${GitHub.repository}/actions/runs/${GitHub.runId}${setAttempts ? `/attempts/${GitHub.runAttempt}` : ''}`;
    }

    public static async printActionsRuntimeTokenACs() {
        let jwt: GitHubActionsRuntimeToken | undefined;
        try {
            jwt = GitHub.actionsRuntimeToken;
        } catch (e: unknown) {
            throw new Error(`Cannot parse GitHub Actions Runtime Token: ${e instanceof Error ? e.message : String(e)}`);
        }
        if (!jwt) {
            throw new Error(`ACTIONS_RUNTIME_TOKEN not set`);
        }
        try {
            <Array<GitHubActionsRuntimeTokenAC>>JSON.parse(`${jwt.ac}`).forEach((ac: GitHubActionsRuntimeTokenAC) => {
                let permission: string;
                switch (ac.Permission) {
                    case 1:
                        permission = 'read';
                        break;
                    case 2:
                        permission = 'write';
                        break;
                    case 3:
                        permission = 'read/write';
                        break;
                    default:
                        permission = `unimplemented (${ac.Permission})`;
                }
                info(`${ac.Scope}: ${permission}`);
            });
        } catch (e: unknown) {
            throw new Error(`Cannot parse GitHub Actions Runtime Token ACs: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
}

import { UploadArtifactOptions, UploadArtifactResponse, ListArtifactsOptions, FindOptions, ListArtifactsResponse, GetArtifactResponse, DownloadArtifactOptions, DownloadArtifactResponse, DeleteArtifactResponse } from '@actions/artifact';
import { TmpNameOptions } from 'tmp';
import { ExecOptions, ExecOutput } from '@actions/exec';
import { Context as Context$2 } from '@actions/github/lib/context';
import { components } from '@octokit/openapi-types';
import { JwtPayload } from 'jwt-decode';
import { GitHub as GitHub$1 } from '@actions/github/lib/utils';
import { SummaryTableRow, SummaryImageOptions } from '@actions/core/lib/summary';
import { PathLike } from 'fs';

interface UploadOptions extends UploadArtifactOptions {
    name: string;
    files: string[];
    rootDirectory?: string;
}
interface UploadResult extends UploadArtifactResponse {
    name: string;
    url?: string;
}
interface DownloadOptions extends DownloadArtifactOptions, FindOptions {
    name: string;
    destination?: string;
}
interface DownloadResult extends DownloadArtifactResponse {
    name: string;
    downloadPath: string;
}
interface ListOptions extends ListArtifactsOptions, FindOptions {
}
interface ListResult extends ListArtifactsResponse {
}
interface GetOptions extends FindOptions {
}
interface GetResult extends GetArtifactResponse {
}
interface DeleteResult extends DeleteArtifactResponse {
}

declare class Artifact {
    private static artifactClient;
    static upload(opts: UploadOptions): Promise<UploadResult>;
    static list(options?: ListOptions): Promise<ListResult>;
    static get(name: string, options?: GetOptions): Promise<GetResult>;
    static download(opts: DownloadOptions): Promise<DownloadResult>;
    static delete(name: string, options?: GetOptions): Promise<DeleteResult>;
}

interface CacheOpts {
    htcName: string;
    htcVersion: string;
    baseCacheDir: string;
    cacheFile: string;
    ghaNoCache?: boolean;
}
interface CachePostState {
    dir: string;
    key: string;
}

declare class Cache {
    private readonly opts;
    private readonly ghaCacheKey;
    private readonly ghaNoCache?;
    private readonly cacheDir;
    private readonly cachePath;
    private static readonly POST_CACHE_KEY;
    constructor(opts: CacheOpts);
    save(file: string, skipState?: boolean): Promise<string>;
    find(): Promise<string>;
    static post(): Promise<CachePostState | undefined>;
    private copyToCache;
    private platform;
}

declare class Context$1 {
    private static readonly _tmpDir;
    private static ensureDirExists;
    static tmpDir(): string;
    static tmpName(options?: TmpNameOptions): string;
    static gitRef(): string;
    static parseGitRef(ref: string, sha: string): string;
    static gitContext(): string;
}

declare class Exec {
    static exec(commandLine: string, args?: string[], options?: ExecOptions): Promise<number>;
    static getExecOutput(commandLine: string, args?: string[], options?: ExecOptions): Promise<ExecOutput>;
}

type Context = Context$2;

declare class Git {
    static context(): Promise<Context>;
    static isInsideWorkTree(): Promise<boolean>;
    static remoteSha(repo: string, ref: string, token?: string): Promise<string>;
    static remoteURL(): Promise<string>;
    static ref(): Promise<string>;
    static fullCommit(): Promise<string>;
    static shortCommit(): Promise<string>;
    static tag(): Promise<string>;
    private static isHeadDetached;
    private static getDetachedRef;
    private static exec;
    static commitDate(ref: string): Promise<Date>;
}

interface GitHubOpts {
    token?: string;
}

type GitHubRepo = components['schemas']['repository'];
interface GitHubActionsRuntimeToken extends JwtPayload {
    ac?: string;
}

declare class GitHub {
    readonly octokit: InstanceType<typeof GitHub$1>;
    constructor(opts?: GitHubOpts);
    repoData(): Promise<GitHubRepo>;
    static get context(): Context$2;
    static get serverURL(): string;
    static get apiURL(): string;
    static get isGHES(): boolean;
    static get repository(): string;
    static get workspace(): string;
    static get runId(): number;
    static get runAttempt(): number;
    static get actionsRuntimeToken(): GitHubActionsRuntimeToken | undefined;
    static workflowRunURL(setAttempts?: boolean): string;
    static printActionsRuntimeTokenACs(): Promise<void>;
}

declare class Summary {
    /**
     * Add a heading
     */
    static addHeading(text: string, level?: 1 | 2 | 3 | 4 | 5 | 6): Summary;
    /**
     * Add a paragraph or plain text
     */
    static addParagraph(text: string): Summary;
    /**
     * Add raw HTML or markdown
     */
    static addRaw(text: string, addEOL?: boolean): Summary;
    /**
     * Add a code block
     */
    static addCodeBlock(code: string, lang?: string): Summary;
    /**
     * Add a list
     */
    static addList(items: string[], ordered?: boolean): Summary;
    /**
     * Add a table
     */
    static addTable(rows: SummaryTableRow[]): Summary;
    /**
     * Add a link
     */
    static addLink(text: string, url: string): Summary;
    /**
     * Add a separator
     */
    static addSeparator(): Summary;
    /**
     * Add a line break
     */
    static addBreak(): Summary;
    /**
     * Add a quote (block quote)
     */
    static addQuote(text: string): Summary;
    /**
     * Add an image
     */
    static addImage(src: string, alt: string, options?: SummaryImageOptions): Summary;
    /**
     * Add a collapsible details block
     */
    static addDetails(label: string, content: string): Summary;
    /**
     * Write summary to file
     */
    static write(overwrite?: boolean): Promise<void>;
    /**
     * Clear summary and overwrite
     */
    static clear(): Promise<void>;
}

interface ListOpts {
    ignoreComma?: boolean;
    comment?: string;
    quote?: string | boolean | Buffer | null;
}

declare class Util {
    static getInputList(name: string, opts?: ListOpts): string[];
    static getList(input: string, opts?: ListOpts): string[];
    static getInputNumber(name: string): number | undefined;
    static asyncForEach<T>(array: T[], callback: (item: T, index: number, array: T[]) => Promise<void>): Promise<void>;
    static isValidURL(urlStr: string): boolean;
    static isValidRef(refStr: string): boolean;
    static powershellCommand(script: string, params?: Record<string, string>): Promise<{
        command: string;
        args: string[];
    }>;
    static isDirectory(p: PathLike): boolean;
    static trimPrefix(str: string, suffix: string): string;
    static trimSuffix(str: string, suffix: string): string;
    static sleep(seconds: number): Promise<unknown>;
    static hash(input: string): string;
    static parseBool(str: string): boolean;
    static formatFileSize(bytes: number): string;
    static generateRandomString(length?: number): string;
    static stringToUnicodeEntities(str: string): string;
    static countLines(input: string): number;
    static isPathRelativeTo(parentPath: string, childPath: string): boolean;
    static formatDuration(ns: number): string;
}

export { Artifact, Cache, Context$1 as Context, Exec, Git, GitHub, Summary, Util };

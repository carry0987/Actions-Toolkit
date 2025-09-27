import { CacheOpts, CachePostState } from '@/interfaces/cache';
import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { platform, arch } from 'os';
import { join } from 'path';
import { format } from 'util';
import { debug, saveState, getState, info } from '@actions/core';
import { cacheDir, find } from '@actions/tool-cache';
import { isFeatureAvailable, saveCache, restoreCache } from '@actions/cache';

export class Cache {
    private readonly opts: CacheOpts;
    private readonly ghaCacheKey: string;
    private readonly ghaNoCache?: boolean;
    private readonly cacheDir: string;
    private readonly cachePath: string;

    private static readonly POST_CACHE_KEY = 'postCache';

    constructor(opts: CacheOpts) {
        this.opts = opts;
        this.ghaCacheKey = format('%s-%s-%s', this.opts.htcName, this.opts.htcVersion, this.platform());
        this.ghaNoCache = this.opts.ghaNoCache;
        this.cacheDir = join(this.opts.baseCacheDir, this.opts.htcVersion, this.platform());
        this.cachePath = join(this.cacheDir, this.opts.cacheFile);
        if (!existsSync(this.cacheDir)) {
            mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    public async save(file: string, skipState?: boolean): Promise<string> {
        debug(`Cache.save ${file}`);
        const cachePath = this.copyToCache(file);

        const htcPath = await cacheDir(this.cacheDir, this.opts.htcName, this.opts.htcVersion, this.platform());
        debug(`Cache.save cached to hosted tool cache ${htcPath}`);

        if (!this.ghaNoCache && isFeatureAvailable()) {
            if (skipState) {
                debug(`Cache.save caching ${this.ghaCacheKey} to GitHub Actions cache`);
                await saveCache([this.cacheDir], this.ghaCacheKey);
            } else {
                debug(`Cache.save sending ${this.ghaCacheKey} to post state`);
                saveState(
                    Cache.POST_CACHE_KEY,
                    JSON.stringify({
                        dir: this.cacheDir,
                        key: this.ghaCacheKey
                    } as CachePostState)
                );
            }
        }

        return cachePath;
    }

    public async find(): Promise<string> {
        let htcPath = find(this.opts.htcName, this.opts.htcVersion, this.platform());
        if (htcPath) {
            info(`Restored from hosted tool cache ${htcPath}`);
            return this.copyToCache(`${htcPath}/${this.opts.cacheFile}`);
        }

        if (!this.ghaNoCache && isFeatureAvailable()) {
            debug(`GitHub Actions cache feature available`);
            if (await restoreCache([this.cacheDir], this.ghaCacheKey)) {
                info(`Restored ${this.ghaCacheKey} from GitHub Actions cache`);
                htcPath = await cacheDir(this.cacheDir, this.opts.htcName, this.opts.htcVersion, this.platform());
                info(`Cached to hosted tool cache ${htcPath}`);
                return this.copyToCache(`${htcPath}/${this.opts.cacheFile}`);
            }
        } else if (this.ghaNoCache) {
            info(`GitHub Actions cache disabled`);
        } else {
            info(`GitHub Actions cache feature not available`);
        }

        return '';
    }

    public static async post(): Promise<CachePostState | undefined> {
        const state = getState(Cache.POST_CACHE_KEY);
        if (!state) {
            info(`State not set`);
            return Promise.resolve(undefined);
        }
        let cacheState: CachePostState;
        try {
            cacheState = <CachePostState>JSON.parse(state);
        } catch (e) {
            throw new Error(`Failed to parse cache post state: ${e}`);
        }
        if (!cacheState.dir || !cacheState.key) {
            throw new Error(`Invalid cache post state: ${state}`);
        }
        info(`Caching ${cacheState.key} to GitHub Actions cache`);
        await saveCache([cacheState.dir], cacheState.key);

        return cacheState;
    }

    private copyToCache(file: string): string {
        debug(`Copying ${file} to ${this.cachePath}`);
        copyFileSync(file, this.cachePath);

        return this.cachePath;
    }

    private platform(): string {
        const arm_version = (process.config.variables as any).arm_version;

        return `${platform()}-${arch()}${arm_version ? 'v' + arm_version : ''}`;
    }
}

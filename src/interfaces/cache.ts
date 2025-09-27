export interface CacheOpts {
    htcName: string;
    htcVersion: string;
    baseCacheDir: string;
    cacheFile: string;
    ghaNoCache?: boolean;
}

export interface CachePostState {
    dir: string;
    key: string;
}

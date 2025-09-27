import type {
    UploadArtifactOptions,
    UploadArtifactResponse,
    DownloadArtifactOptions,
    DownloadArtifactResponse,
    ListArtifactsOptions,
    ListArtifactsResponse,
    GetArtifactResponse,
    FindOptions,
    DeleteArtifactResponse
} from '@actions/artifact';

export interface UploadOptions extends UploadArtifactOptions {
    name: string;
    files: string[]; // list of file paths
    rootDirectory?: string; // Default is process.cwd()
}

export interface UploadResult extends UploadArtifactResponse {
    name: string;
    url?: string;
}

export interface DownloadOptions extends DownloadArtifactOptions, FindOptions {
    name: string;
    destination?: string; // Default is process.cwd()
}

export interface DownloadResult extends DownloadArtifactResponse {
    name: string;
    downloadPath: string;
}

export interface ListOptions extends ListArtifactsOptions, FindOptions {}
export interface ListResult extends ListArtifactsResponse {}
export interface GetOptions extends FindOptions {}
export interface GetResult extends GetArtifactResponse {}
export interface DeleteResult extends DeleteArtifactResponse {}

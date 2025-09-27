import {
    UploadOptions,
    UploadResult,
    GetOptions,
    GetResult,
    ListOptions,
    ListResult,
    DeleteResult,
    DownloadOptions,
    DownloadResult
} from '@/interfaces/artifact';
import { GitHub } from '@/github';
import { InvalidResponseError, NetworkError } from '@actions/artifact';
import { DefaultArtifactClient } from '@actions/artifact';
import { info } from '@actions/core';
import path from 'path';

export class Artifact {
    private static artifactClient = new DefaultArtifactClient();

    public static async upload(opts: UploadOptions): Promise<UploadResult> {
        let result: Omit<UploadResult, 'name' | 'url'>;
        const { name, files, rootDirectory, retentionDays, compressionLevel } = opts;
        info(`[Artifact] Uploading artifact: ${name}`);
        const root = rootDirectory ?? process.cwd();
        const retention = retentionDays ?? 90;
        const compression = compressionLevel ?? 6;

        try {
            result = await Artifact.artifactClient.uploadArtifact(name, files, root, {
                retentionDays: retention,
                compressionLevel: compression
            });
        } catch (error: any) {
            if (NetworkError.isNetworkErrorCode(error?.code)) {
                throw new NetworkError(error?.code);
            }
            throw error;
        }

        if (!result.id) {
            throw new InvalidResponseError('Cannot finalize artifact upload');
        }

        const artifactId = BigInt(result.id);
        info(`[Artifact] Successfully finalized (${artifactId})`);

        const artifactURL = `${GitHub.workflowRunURL()}/artifacts/${artifactId}`;
        info(`[Artifact] Download URL: ${artifactURL}`);

        return {
            id: result.id,
            name: path.basename(name),
            size: result.size,
            digest: result.digest,
            url: artifactURL
        };
    }

    public static async list(options?: ListOptions): Promise<ListResult> {
        info('[Artifact] Listing artifacts');

        return await Artifact.artifactClient.listArtifacts(options);
    }

    public static async get(name: string, options?: GetOptions): Promise<GetResult> {
        info(`[Artifact] Getting artifact info: ${name}`);

        return await Artifact.artifactClient.getArtifact(name, options);
    }

    public static async download(opts: DownloadOptions): Promise<DownloadResult> {
        const { name, destination, expectedHash, findBy } = opts;
        info(`[Artifact] Downloading artifact: ${name}`);

        // Get artifact ID by name
        const getRes = await Artifact.artifactClient.getArtifact(name, findBy ? { findBy } : undefined);
        if (!getRes.artifact?.id) throw new InvalidResponseError(`Artifact "${name}" not found`);
        const artifactId = getRes.artifact.id;

        // Combine options
        const dlOpts: Omit<DownloadOptions, 'name'> = {
            ...(destination ? { path: destination } : { path: process.cwd() }),
            ...(expectedHash ? { expectedHash } : {}),
            ...(findBy ? { findBy } : {})
        };

        const dlRes = await Artifact.artifactClient.downloadArtifact(artifactId, dlOpts);

        if (!dlRes.downloadPath) throw new InvalidResponseError('Cannot download artifact or download path not found');

        return {
            name,
            downloadPath: dlRes.downloadPath,
            digestMismatch: dlRes.digestMismatch
        };
    }

    public static async delete(name: string, options?: GetOptions): Promise<DeleteResult> {
        info(`[Artifact] Deleting artifact: ${name}`);

        return await Artifact.artifactClient.deleteArtifact(name, options);
    }
}

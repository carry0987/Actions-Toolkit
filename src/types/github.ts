import { AnnotationProperties } from '@actions/core';
import { components as OctoOpenApiTypes } from '@octokit/openapi-types';
import { JwtPayload } from 'jwt-decode';

export interface GitHubRelease {
    id: number;
    tag_name: string;
    html_url: string;
    assets: Array<string>;
}

export type GitHubRepo = OctoOpenApiTypes['schemas']['repository'];

export interface GitHubActionsRuntimeToken extends JwtPayload {
    ac?: string;
}

export interface GitHubActionsRuntimeTokenAC {
    Scope: string;
    Permission: number;
}

export interface GitHubAnnotation extends AnnotationProperties {
    message: string;
}

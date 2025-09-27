import { defineConfig } from 'vitest/config';
import path from 'path';
import fs from 'fs';
import os from 'os';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docker-actions-toolkit-'));

process.env = Object.assign({}, process.env, {
    TEMP: tmpDir,
    GITHUB_REPOSITORY: 'carry0987/actions-toolkit',
    GITHUB_RUN_ATTEMPT: 2,
    GITHUB_RUN_ID: 2188748038,
    GITHUB_RUN_NUMBER: 15,
    RUNNER_TEMP: path.join(tmpDir, 'runner-temp'),
    RUNNER_TOOL_CACHE: path.join(tmpDir, 'runner-tool-cache')
}) as {
    [key: string]: string;
};

export default defineConfig({
    test: {
        projects: [
            {
                resolve: {
                    alias: {
                        '@': path.resolve(__dirname, 'src')
                    }
                },
                test: {
                    root: './test',
                    name: { label: 'core', color: 'green' },
                    environment: 'node'
                }
            }
        ],
        coverage: {
            // Test coverage options (optional)
            reporter: ['text', 'json', 'html']
        },
        typecheck: {
            // Type check options (optional)
            enabled: true
        }
    }
});

import { debug } from '@actions/core';
import { exec, getExecOutput } from '@actions/exec';
import { ExecOptions, ExecOutput } from '@actions/exec';

export class Exec {
    public static async exec(commandLine: string, args?: string[], options?: ExecOptions): Promise<number> {
        debug(`Exec.exec: ${commandLine} ${args?.join(' ')}`);

        return exec(commandLine, args, options);
    }

    public static async getExecOutput(
        commandLine: string,
        args?: string[],
        options?: ExecOptions
    ): Promise<ExecOutput> {
        debug(`Exec.getExecOutput: ${commandLine} ${args?.join(' ')}`);

        return getExecOutput(commandLine, args, options);
    }
}

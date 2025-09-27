import { describe, expect, it, vi } from 'vitest';
import { Exec } from '@/exec';

describe('exec', () => {
    it('returns docker version', async () => {
        const execSpy = vi.spyOn(Exec, 'exec');
        await Exec.exec('docker', ['version'], {
            ignoreReturnCode: true,
            silent: true
        });
        expect(execSpy).toHaveBeenCalledWith(`docker`, ['version'], {
            ignoreReturnCode: true,
            silent: true
        });
    });
});

describe('getExecOutput', () => {
    it('returns docker version', async () => {
        const execSpy = vi.spyOn(Exec, 'getExecOutput');
        await Exec.getExecOutput('docker', ['version'], {
            ignoreReturnCode: true,
            silent: true
        });
        expect(execSpy).toHaveBeenCalledWith(`docker`, ['version'], {
            ignoreReturnCode: true,
            silent: true
        });
    });
});

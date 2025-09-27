import { Cache } from '@/cache';
import { saveState, setFailed, group } from '@actions/core';

const isPost = !!process.env['STATE_isPost'];
if (!isPost) {
    saveState('isPost', 'true');
}

/**
 * Runs a GitHub Action.
 * Output will be streamed to the live console.
 *
 * @param     main            runs the defined function.
 * @param     post            runs the defined function at the end of the job if set.
 * @returns   Promise<void>
 */
export async function run(main: () => Promise<void>, post?: () => Promise<void>): Promise<void> {
    if (!isPost) {
        try {
            await main();
        } catch (e: unknown) {
            setFailed(e instanceof Error ? e.message : String(e));
        }
    } else {
        if (post) {
            await post();
        }
        await group(`Post cache`, async () => {
            await Cache.post();
        });
    }
}

import { Job } from 'dbb/lib/jobs'
import { GuildInitializerResult } from 'dbb/lib/bootstrapper';
import { KeyValueStorage } from 'dbb/lib/storage';

type CheckLiveState = {
    twitchIds: string[];
}

export class CheckLiveJob extends Job<CheckLiveState> {
    name = 'checkTwithLive'
    constructor(storage: GuildInitializerResult<KeyValueStorage>) {
        super(storage, 10 * 1000);
    }

    runInternal(state: CheckLiveState): Promise<CheckLiveState> {
        return Promise.resolve(state);
    }
}
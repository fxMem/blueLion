import { Job } from "../jobs/Job";

type CheckLiveState = {
    twitchIds: string[];
}

export class CheckLiveJob extends Job<CheckLiveState> {
    name = 'checkTwithLive'
    constructor() {
        super(10 * 1000);
    }

    runInternal(state: CheckLiveState): Promise<CheckLiveState> {
        return Promise.resolve(state);        
    }
}
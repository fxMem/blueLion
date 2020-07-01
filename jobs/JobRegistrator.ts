import { Job, AbstractJob } from "./Job";
import { globalStorage } from "../storage/ChannelStorage";
import { GuildInitializerResult } from "../bootstrapper/GuildBootstrapper";

export const allJobs: AbstractJob[] = [];
export function registerJobs(...jobs: AbstractJob[]) {
    let nextInChain: GuildInitializerResult<AbstractJob> = null;
    for (const job of jobs) {
        allJobs.push(job);
        nextInChain = nextInChain ? nextInChain.chain(job) : globalStorage.chain(job);
    }

    return nextInChain;
};
import { Job, AbstractJob } from "./Job";
import { globalStorage } from "../storage/ChannelStorage";
import { GuildInitializerResult } from "../bootstrapper/GuildBootstrapper";

export const allJobs: AbstractJob[] = [];
export function registerJobs(...jobs: AbstractJob[]): GuildInitializerResult<AbstractJob>[] {
    let chainTail: GuildInitializerResult<AbstractJob> = null;
    let allResults: GuildInitializerResult<AbstractJob>[] = [];
    for (const job of jobs) {
        allJobs.push(job);
        chainTail = chainTail ? chainTail.chain(job) : globalStorage.chain(job);
        allResults.push(chainTail);
    }

    return allResults;
};
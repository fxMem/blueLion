import { Job, AbstractJob } from "./Job";
import { globalStorage } from "../storage/ChannelStorage";
import { GuildInitializerResult } from "../bootstrapper/GuildBootstrapper";
import { registerClassInitializer, buildClassInitializer } from "../bootstrapper/RequiresGuildInitialization";

const registerJobsName = 'job';
const allJobs: GuildInitializerResult<AbstractJob>[] = [];
export type JobFactory = {
    name: string;
    factory: () => AbstractJob;
}

export function registerJobs(...jobFactories: JobFactory[]): GuildInitializerResult<AbstractJob>[] {
    let chainTail: GuildInitializerResult<AbstractJob> = null;
    let allResults: GuildInitializerResult<AbstractJob>[] = [];
    for (const jobFactory of jobFactories) {
        chainTail = chainTail
            ? chainTail.chain(buildClassInitializer(jobFactory.factory), jobFactory.name)
            : globalStorage.chain(buildClassInitializer(jobFactory.factory), jobFactory.name);
        allJobs.push(chainTail);
        allResults.push(chainTail);
    }

    return allResults;
};
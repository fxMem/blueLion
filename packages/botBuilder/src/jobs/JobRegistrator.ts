import { Job, AbstractJob } from "./Job";
import { GuildInitializerResult } from "../bootstrapper/GuildBootstrapper";
import { registerClassInitializer, buildClassInitializer } from "../bootstrapper/RequiresGuildInitialization";
import { JobRunner } from "./JobRunner";
import { KeyValueStorage } from "../storage";

const registerJobsName = 'job';
const allJobs: GuildInitializerResult<AbstractJob>[] = [];
export type JobFactory = {
    name: string;
    factory: (storage: GuildInitializerResult<KeyValueStorage>) => AbstractJob;
}

export function registerJobs(jobFactories: JobFactory[], globalStorage: GuildInitializerResult<KeyValueStorage>) {
    let chainTail: GuildInitializerResult<AbstractJob> = null;
    let allResults: GuildInitializerResult<AbstractJob>[] = [];
    for (const jobFactory of jobFactories) {
        const factory = () => jobFactory.factory(globalStorage);
        chainTail = chainTail
            ? chainTail.chain(buildClassInitializer(factory), jobFactory.name)
            : globalStorage.chain(buildClassInitializer(factory), jobFactory.name);
        allJobs.push(chainTail);
        allResults.push(chainTail);
    }

    return allResults[allResults.length - 1].chain(
        buildClassInitializer(() => new JobRunner(allResults, globalStorage)),
        'JobRunner'
    );
};
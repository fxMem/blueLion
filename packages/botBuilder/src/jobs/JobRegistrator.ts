import { AbstractJob } from "./Job";
import { GuildSource } from "../bootstrapper/GuildBootstrapper";
import { registerInitializers } from "../bootstrapper/RequiresGuildInitialization";
import { JobRunner } from "./JobRunner";
import { KeyValueStorage } from "../storage";

export type JobFactory = (storage: GuildSource<KeyValueStorage>) => AbstractJob;

export function registerJobs(jobFactories: JobFactory[], globalStorage: GuildSource<KeyValueStorage>) {
    const factories = jobFactories.map(f => () => f(globalStorage));
    const results = registerInitializers(factories);

    return results[results.length - 1].chain(
        () => new JobRunner(results)
    );
};
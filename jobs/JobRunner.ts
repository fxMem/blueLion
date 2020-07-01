import { GuildContext } from "../discord/GuildContext";
import { globalStorage } from "../storage/ChannelStorage";
import { RequiresGuildInitialization } from "../bootstrapper/RequiresGuildInitialization";
import { allJobs } from "./JobRegistrator";
import { getStateStorageKey, JobRunningInfo, AbstractJob } from "./Job";
import { createLocalLogScope } from "../log/LogScopes";

type JobInfo = {
    info: JobRunningInfo,
    job: AbstractJob,
    error?: any
};

export class JobRunner implements RequiresGuildInitialization {
    logger = createLocalLogScope('JobRunner');
    sortedJobs: JobInfo[];

    initializeGuild(context: GuildContext): Promise<void> {
        return globalStorage.ensure(context).then(storage => {
            const jobStates = allJobs.map(job => {
                const storageKey = getStateStorageKey(job.name);
                return storage.get<JobRunningInfo>(storageKey).then(info => ({
                    info,
                    job
                }));
            });
            return Promise.all(jobStates);
        }).then(jobs => {
            this.sortedJobs = this.sortJobQueue(jobs);
            this.logger.info(`Loaded jobs: ${this.sortedJobs.map(j => j.job.name).join(', ')}`);

            this.enqueueNextJob();
        });
    }

    private enqueueNextJob() {
        const nextJob = this.sortedJobs[0];
        const timeBeforeNextJobRun = nextJob.info.runAfter.getTime() - new Date().getTime();
        setTimeout(() => {
            this.runJob(nextJob)
        }, timeBeforeNextJobRun);
    }

    private runJob(jobInfo: JobInfo) {
        const jobName = jobInfo.job.name;
        this.logger.info(`Preparing to run [${jobName}] job!`);
        jobInfo.job.run().then(nextRun => {
            this.logger.info(`Successfully run [${jobName}] job!`);
            jobInfo.info.runAfter = nextRun;
        }).catch(e => {
            this.logger.error(`Job [${jobName}] faulted! Error: ${e}`);
            jobInfo.error = e;
            this.sortedJobs = this.sortedJobs.filter(j => j !== jobInfo);

        }).finally(() => {
            this.sortedJobs = this.sortJobQueue(this.sortedJobs);
            this.enqueueNextJob();
        });
    }

    private sortJobQueue(jobs: JobInfo[]): JobInfo[] {
        return jobs.sort((a, b) => a.info.runAfter.getTime() - b.info.runAfter.getTime());
    }
}

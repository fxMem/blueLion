import { RequiresGuildInitialization } from "../bootstrapper/RequiresGuildInitialization";
import { GuildContext } from "../discord/GuildContext";
import { GuildInitializerResult } from "../bootstrapper";
import { KeyValueStorage } from "../storage";

export function getStateStorageKey(jobName: string): string {
    return `state:${jobName}`
}

export type JobRunningInfo = {
    previousRun?: Date;
    runAfter: Date;
}

export type JobState<TUserJobState> = {
    userState?: TUserJobState;
} & JobRunningInfo

export interface AbstractJob extends RequiresGuildInitialization {
    name: string;
    run(): Promise<Date>;
    getState(context: GuildContext): Promise<JobRunningInfo>;
}

export abstract class Job<TUserJobState> implements AbstractJob {
    context: GuildContext;
    name: string;
    state: JobState<TUserJobState>;

    constructor(
        private globalStorage: GuildInitializerResult<KeyValueStorage>,
        private interval: number, 
        private reviver?: (value: any) => TUserJobState) {
    }

    initializeGuild(): Promise<void> {
        return this.updateState().then(() => {
            if (!this.state) {
                return this.updateTimeAndSaveState(null).then(_ => { });
            }
        });
    }

    run() {
        return this.updateState().then(_ => {
            return this.runInternal(this.state.userState);
        }).then(updatedState => {
            return this.updateTimeAndSaveState(updatedState);
        });
    }

    getState() {
        return this.globalStorage.ensure(this.context).then(storage => {
            return storage.get<JobState<TUserJobState>>(this.getStateStorageKey(), this.parseState.bind(this));
        });
    }

    abstract runInternal(state: TUserJobState): Promise<TUserJobState>;

    private updateTimeAndSaveState(userState: TUserJobState): Promise<Date> {
        return this.globalStorage.ensure(this.context).then(storage => {
            const nextRun = this.calculateNextRunDate();
            return storage.set(this.getStateStorageKey(), {
                previousRunDate: new Date(),
                runAfter: nextRun,
                userState
            }).then(() => {
                return nextRun;
            });
        })
    }

    private updateState() {
        return this.getState().then(previousState => {
            this.state = previousState;
        });
    }
    private getStateStorageKey() {
        return getStateStorageKey(this.name);
    }

    private calculateNextRunDate() { return new Date(new Date().getTime() + this.interval); }

    private parseState(previousState: string) {
        return previousState && JSON.parse(previousState, (key: string, value: any) => {
            if (key === 'userState') {
                return (this.reviver && this.reviver(value)) || value;
            }
            else if (key === 'previousRun' || key === 'runAfter') {
                return new Date(value);
            }

            return value;
        }) as JobState<TUserJobState>;
    }
}

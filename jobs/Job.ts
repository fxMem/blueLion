import { RequiresGuildInitialization } from "../bootstrapper/RequiresGuildInitialization";
import { GuildContext } from "../discord/GuildContext";
import { globalStorage } from "../storage/ChannelStorage";

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
    name: string;
    context: GuildContext;
    state: JobState<TUserJobState>;

    constructor(private interval: number, private reviver?: (value: any) => TUserJobState) {

    }

    initializeGuild(context: GuildContext): Promise<void> {
        this.context = context;
        return this.updateState(this.context).then(() => {
            if (!this.state) {
                return this.saveState(null).then(_ => { });
            }
        });
    }

    run() {
        return this.updateState(this.context).then(_ => {
            return this.runInternal(this.state.userState);
        }).then(updatedState => {
            return this.saveState(updatedState);
        });
    }

    getState() {
        return globalStorage.ensure(this.context).then(storage => {
            return storage.get<JobState<TUserJobState>>(this.getStateStorageKey(), this.parseState.bind(this));
        });
    }

    abstract runInternal(state: TUserJobState): Promise<TUserJobState>;

    private saveState(userState: TUserJobState): Promise<Date> {
        return globalStorage.ensure(this.context).then(storage => {
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

    private updateState(context: GuildContext) {
        return globalStorage.ensure(context).then(storage => {
            return storage.get<JobState<TUserJobState>>(this.getStateStorageKey(), this.parseState.bind(this));
        }).then(previousState => {
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


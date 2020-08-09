import { Bootstrapper } from "dbb/lib/bootstrapper/Bootstrapper";
import { CheckLiveJob } from "./CheckLiveJob";
import { TwitchCommand } from "./TwitchCommand";

export function registerTwitchCommands(bootstrapper: Bootstrapper) {
    bootstrapper.addJobs([
        storage => new CheckLiveJob(storage)
    ]).addCommands([
        () => new TwitchCommand()
    ]);
}
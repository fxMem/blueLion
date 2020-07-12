import { LiveNotification } from "./LiveNotification";
import { twitchLocalization } from "./TwitchLocalization";
import { AggregateCommandBase } from "dbb/lib/commands";

export class TwitchCommand extends AggregateCommandBase {
    name = 'twitch';
    description = twitchLocalization.twitchCommandDescription;

    subCommands = [new LiveNotification()];
}
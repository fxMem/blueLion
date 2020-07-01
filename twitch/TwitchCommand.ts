import { AggregateCommandBase } from "../commands/AggregateCommandBase";
import { LiveNotification } from "./LiveNotification";
import { twitchLocalization } from "./TwitchLocalization";

export class TwitchCommand extends AggregateCommandBase {
    name = 'twitch';
    description = twitchLocalization.twitchCommandDescription;

    subCommands = [new LiveNotification()];
}
import { LiveNotificationCommand } from "./LiveNotificationCommand";
import { twitchLocalization } from "./TwitchLocalization";
import { AggregateCommandBase } from "dbb/lib/commands";

export class TwitchCommand extends AggregateCommandBase {
    name = 'twitch';
    description = twitchLocalization.twitchCommandDescription;

    subCommands = [new LiveNotificationCommand()];
}
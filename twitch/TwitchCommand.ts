import { AggregateCommandBase } from "../AggregateCommandBase";
import { LiveNotification } from "./LiveNotification";
import { localizedStringBuilder } from "../localization/LocalizedString";
import { twitchLocalization } from "./TwitchLocalization";

export class TwitchCommand extends AggregateCommandBase {
    name = 'twitch';
    description = twitchLocalization.twitchCommandDescription;

    subCommands = [new LiveNotification()];
}
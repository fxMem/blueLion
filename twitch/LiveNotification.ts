import { Command } from "../Command";
import { GuildContext } from "../discord/GuildContext";
import { build, required, mention } from "../CommandArgumentsMap";
import { localizedStringBuilder } from "../localization/LocalizedString";
import { twitchLocalization } from "./TwitchLocalization";

export class LiveNotification implements Command {
    name = 'notify';
    description = localizedStringBuilder(twitchLocalization.notifyCommandDescription);

    argumentsMap = build([required('channelName'), mention()]);
    invoke(context: GuildContext, channelName: string): void {

    }
}
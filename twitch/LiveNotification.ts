import { Command } from "../Command";
import { GuildContext } from "../discord/GuildContext";
import { build, required, mention } from "../CommandArgumentsMap";
import { twitchLocalization } from "./TwitchLocalization";

export class LiveNotification implements Command {
    name = 'notify';
    description = twitchLocalization.notifyCommandDescription;

    argumentsMap = build([required('channelName'), mention().required()]);
    invoke(context: GuildContext, channelName: string): void {

    }
}
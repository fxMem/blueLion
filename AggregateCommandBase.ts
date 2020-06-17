import { AggregateCommand } from "./AggregateCommand";
import { Command, invokeCommand } from "./Command";
import { CommandArgumentMetadata, required, build, optional } from "./CommandArgumentsMap";
import { DiscordContext } from "./discord/DiscordContext";
import { CommandArgument } from "./CommandArgument";
import { LocalizedString } from "./localization/LocalizedString";

export class AggregateCommandBase implements AggregateCommand {
    name: string;
    description?: LocalizedString;
    subCommands: (AggregateCommand | Command)[];

    argumentsMap = build([required('subCommand'), optional('rest').catchAll()]);

    invoke(context: DiscordContext, subCommand: string, subArguments: CommandArgument[]): void {
        const targetCommand = this.subCommands.find(c => c.name === subCommand);
        if (!targetCommand) {
            throw new Error(`Cannot resolve sub-command ${subCommand} in aggregated command ${this.name}!`);
        }

        return invokeCommand(targetCommand, subArguments, context);
    }
}
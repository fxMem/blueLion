import { AggregateCommand } from "./AggregateCommand";
import { Command, invokeCommand } from "./Command";
import { CommandArgumentMetadata, required, build, optional } from "./CommandArgumentsMap";
import { GuildContext } from "./discord/GuildContext";
import { CommandArgument } from "./CommandArgument";
import { LocalizedString } from "./localization/LocalizedString";
import { CommandBase } from "./CommandBase";

export class AggregateCommandBase implements AggregateCommand {
    name: string;
    description?: LocalizedString;
    subCommands: (AggregateCommand | Command)[];

    argumentsMap = build([required('subCommand'), optional('rest').catchAll()]);

    invoke(context: GuildContext, subCommand: string, subArguments: CommandArgument[]): Promise<void> | void {
        const targetCommand = this.subCommands.find(c => c.name === subCommand);
        if (!targetCommand) {
            throw new Error(`Cannot resolve sub-command ${subCommand} in aggregated command ${this.name}!`);
        }

        return invokeCommand(targetCommand, subArguments, context);
    }
}
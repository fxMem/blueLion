import { AggregateCommand } from "./AggregateCommand";
import { Command, invokeCommandWithContext } from "./Command";
import { required, build, optional } from "./CommandArgumentsMap";
import { CommandArgument } from "./CommandArgument";
import { LocalizedString } from "../localization/LocalizedString";
import { CommandContext } from "./CommandContext";
import { GuildContext } from "../discord";

export class AggregateCommandBase implements AggregateCommand {
    context: GuildContext;
    name: string;
    description?: LocalizedString;
    subCommands: (AggregateCommand | Command)[];

    argumentsMap = build([required('subCommand'), optional('rest').catchAll()]);

    initializeGuild() { return Promise.resolve(); }

    invoke(context: CommandContext, subCommand: string, subArguments: CommandArgument[]): Promise<void> | void {
        const targetCommand = this.subCommands.find(c => c.name === subCommand);
        if (!targetCommand) {
            throw new Error(`Cannot resolve sub-command ${subCommand} in aggregated command ${this.name}!`);
        }

        return invokeCommandWithContext(targetCommand, subArguments, context);
    }
}
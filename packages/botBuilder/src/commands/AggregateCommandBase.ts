import { AggregateCommand } from "./AggregateCommand";
import { Command, invokeCommandWithContext} from "./Command";
import { required, build, optional } from "./CommandArgumentsMap";
import { CommandArgument } from "./CommandArgument";
import { LocalizedString } from "../localization/LocalizedString";
import { CommandContext } from "./CommandContext";

export class AggregateCommandBase implements AggregateCommand {
    name: string;
    description?: LocalizedString;
    subCommands: (AggregateCommand | Command)[];

    argumentsMap = build([required('subCommand'), optional('rest').catchAll()]);

    invoke(context: CommandContext, subCommand: string, subArguments: CommandArgument[]): Promise<void> | void {
        const targetCommand = this.subCommands.find(c => c.name === subCommand);
        if (!targetCommand) {
            throw new Error(`Cannot resolve sub-command ${subCommand} in aggregated command ${this.name}!`);
        }

        return invokeCommandWithContext(targetCommand, subArguments, context);
    }
}
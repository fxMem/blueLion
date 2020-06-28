import { Command } from "../Command";
import { optional, build, CommandArgumentMetadata, CommandArgumentType } from "../CommandArgumentsMap";
import { GuildContext } from "../discord/GuildContext";
import { registeredCommands } from "../RegisteredCommands";
import config from '.././config.json';
import { isAggregateCommand } from "../AggregateCommand";
import { flatten } from "../common/ArrayHelpers";
import { bold, italic, code } from "../common/DiscordFormattingHelpers";
import { localization } from "./HelpCommandLocalization";

export class HelpCommand implements Command {
    name = 'help';
    description = localization.description;

    argumentsMap = build([optional('commandName')]);

    invoke(context: GuildContext, commandName: string) {
        if (commandName) {

            const targetCommand = registeredCommands.find(c => c.name === commandName);
            if (!targetCommand) {
                context.channel.send(`${localization.commandNotFound()} (${commandName})`);
            }
            else {
                context.channel.send([
                    ...buildCommandFullDescription(targetCommand)
                ]
                )
            }
        }
        else {
            context.channel.send([
                localization.availableCommands(),
                ...flatten(registeredCommands.map(c => buildCommandShortDescription(c)))
            ])
        }
    }
}

function buildCommandShortDescription(command: Command): string[] {
    return [
        bold(command.name),
        italic(command.description() ?? localization.noDescription())
    ]
}

function buildCommandFullDescription(command: Command): string[] {
    return [
        ...buildCommandShortDescription(command),
        ...buildCommandUsageDescription(command)
    ]
}

function buildCommandUsageDescription(command: Command): string[] {
    if (isAggregateCommand(command)) {
        return [
            localization.complexCommand(),
            ...flatten(command.subCommands.map(c => buildCommandShortDescription(c))).map(d => `    ${d}`),
            localization.complexCommandHint(config.prefix, command.name, command.subCommands[0].name)
        ]
    }
    else {
        return [`${localization.usage()} ${code(formatArgumentsUsageHint(command))}`];
    }
}

function formatArgumentsUsageHint({ name, argumentsMap }: Command) {
    return `${config.prefix} ${name} ${argumentsMap.map(a => `<${getArgumentName(a)}${getArgumentType(a)}>`).join(' ')}`;
}

function getArgumentName(arg: CommandArgumentMetadata) {
    return arg.type === CommandArgumentType.mentions ? localization.mentions() : arg.name ?? arg.index;
}

function getArgumentType(arg: CommandArgumentMetadata) {
    return arg.isRequired ? `:${localization.required()}` : `:${localization.optional()}`;
}


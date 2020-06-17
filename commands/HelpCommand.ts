import { Command } from "../Command";
import { optional, build, CommandArgumentMetadata, CommandArgumentType } from "../CommandArgumentsMap";
import { DiscordContext } from "../discord/DiscordContext";
import { registeredCommands } from "../RegisteredCommands";
import config from '.././config.json';
import { isAggregateCommand } from "../AggregateCommand";
import { flatten } from "../common/ArrayHelpers";
import { bold, italic, code } from "../common/DiscordFormattingHelpers";
import { localizedStringBuilder } from "../localization/LocalizedString";
import { Language } from "../localization/Language";

export class HelpCommand implements Command {
    name = 'help';
    description = localizedStringBuilder({
        ['ENG']: 'Provides information about available commands.',
        ['RU']: 'Дает информацию о доступных командах.'
    });

    argumentsMap = build([optional('commandName')]);

    invoke(context: DiscordContext, commandName: string) {
        if (commandName) {

            const targetCommand = registeredCommands.find(c => c.name === commandName);
            if (!targetCommand) {
                context.channel.send(`Cannot find the command you've just requested! (${commandName})`);
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
                `Available commands:`,
                ...flatten(registeredCommands.map(c => buildCommandShortDescription(c)))
            ])
        }
    }
}

function buildCommandShortDescription(command: Command): string[] {
    return [
        bold(command.name),
        italic(command.description() ?? 'This command has no description')
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
            `This is a complex command! Available sub commands to run:`,
            ...flatten(command.subCommands.map(c => buildCommandShortDescription(c))).map(d => `    ${d}`),
            `To get help for specific command, run ${code(`${config.botPrefix} help ${command.name} <sub command name>`)}, for ex. ${code(`${config.botPrefix} help ${command.name} ${command.subCommands[0].name}`)}`
        ]
    }
    else {
        return [`Usage: ${code(formatArgumentsUsageHint(command))}`];
    }
}

function formatArgumentsUsageHint({ name, argumentsMap }: Command) {
    return `${config.botPrefix} ${name} ${argumentsMap.map(a => `<${getArgumentName(a)}${getArgumentType(a)}>`).join(' ')}`;
}

function getArgumentName(arg: CommandArgumentMetadata) {
    return arg.type === CommandArgumentType.mentions ? 'mentions' : arg.name ?? arg.index;
}

function getArgumentType(arg: CommandArgumentMetadata) {
    return arg.isRequired ? ':required' : ':optional';
}


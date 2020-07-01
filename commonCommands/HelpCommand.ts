import { Command } from "../commands/Command";
import { optional, build, CommandArgumentMetadata, CommandArgumentType } from "../commands/CommandArgumentsMap";
import { GuildContext } from "../discord/GuildContext";
import { registeredCommands } from "../RegisteredCommands";
import config from '../config.json';
import { isAggregateCommand } from "../commands/AggregateCommand";
import { flatten } from "../common/ArrayHelpers";
import { bold, italic, code } from "../common/DiscordFormattingHelpers";
import { localization } from "./HelpCommandLocalization";
import { CommandBase } from "../commands/CommandBase";
import { Language } from "../localization/Language";
import { CommandArgument } from "../commands/CommandArgument";

export class HelpCommand extends CommandBase {
    name = 'help';
    description = localization.description;

    argumentsMap = build([optional('commandNames').catchAll()]);

    doInvoke(commandNames: CommandArgument[]) {
        const currentLanguage = this.currentLanguage;
        const rawCommandNames = commandNames.map(c => c.value);

        if (commandNames.length > 0) {
            const rootCommand = registeredCommands.find(c => c.name === rawCommandNames[0]);
            const targetCommand = findCommand(rootCommand, rawCommandNames, 1);
            this.context.channel.send([
                ...buildCommandFullDescription(targetCommand, rawCommandNames.join(' '), this.currentLanguage)
            ]);
        }
        else {
            this.context.channel.send([
                localization.availableCommands(this.currentLanguage),
                ...flatten(registeredCommands.map(c => buildCommandShortDescription(c, c.name, this.currentLanguage)))
            ])
        }

        function findCommand(previousCommand: Command, commandNames: string[], currentCommandIndex: number): Command {
            if (!previousCommand) {
                throw new Error(`${localization.commandNotFound(currentLanguage)} (${commandNames[currentCommandIndex - 1]})`);
            }

            if (commandNames.length - 1 < currentCommandIndex) {
                return previousCommand;
            }

            const currentCommandName = commandNames[currentCommandIndex];
            if (!isAggregateCommand(previousCommand)) {
                throw new Error(`Command ${previousCommand.name} is not aggregate command and don't have ${currentCommandName} sub-command!`);
            }

            return findCommand(previousCommand.subCommands.find(c => c.name === currentCommandName), commandNames, currentCommandIndex + 1);
        }
    }
}

function buildCommandShortDescription(command: Command, fullCommandPath: string, language: Language): string[] {
    return [
        bold(fullCommandPath),
        italic(command.description(language) ?? localization.noDescription(language))
    ]
}

function buildCommandFullDescription(command: Command, fullCommandPath: string, language: Language): string[] {
    return [
        ...buildCommandShortDescription(command, fullCommandPath, language),
        ...buildCommandUsageDescription(command, fullCommandPath, language)
    ]
}

function buildCommandUsageDescription(command: Command, fullCommandPath: string, language: Language): string[] {
    if (isAggregateCommand(command)) {
        return [
            localization.complexCommand(language),
            ...flatten(command.subCommands.map(c => buildCommandShortDescription(c, `${c.name}`, language))).map(d => `    ${d}`),
            localization.complexCommandHint(language, config.prefix, command.name, command.subCommands[0].name)
        ]
    }
    else {
        return [`${localization.usage(language)} ${code(formatArgumentsUsageHint(command, fullCommandPath, language))}`];
    }
}

function formatArgumentsUsageHint({ name, argumentsMap }: Command, fullCommandPath: string, language: Language) {
    return `${config.prefix} ${fullCommandPath} ${argumentsMap.map(a => `<${getArgumentName(a, language)}${getArgumentType(a, language)}>`).join(' ')}`;
}

function getArgumentName(arg: CommandArgumentMetadata, language: Language) {
    return arg.type === CommandArgumentType.mentions ? localization.mentions(language) : arg.name ?? arg.index;
}

function getArgumentType(arg: CommandArgumentMetadata, language: Language) {
    return arg.isRequired ? `:${localization.required(language)}` : `:${localization.optional(language)}`;
}


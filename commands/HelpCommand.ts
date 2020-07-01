import { Command } from "../Command";
import { optional, build, CommandArgumentMetadata, CommandArgumentType } from "../CommandArgumentsMap";
import { GuildContext } from "../discord/GuildContext";
import { registeredCommands } from "../RegisteredCommands";
import config from '.././config.json';
import { isAggregateCommand } from "../AggregateCommand";
import { flatten } from "../common/ArrayHelpers";
import { bold, italic, code } from "../common/DiscordFormattingHelpers";
import { localization } from "./HelpCommandLocalization";
import { CommandBase } from "../CommandBase";
import { Language } from "../localization/Language";

export class HelpCommand extends CommandBase {
    name = 'help';
    description = localization.description;

    argumentsMap = build([optional('commandName')]);

    doInvoke(commandName: string) {
        if (commandName) {

            const targetCommand = registeredCommands.find(c => c.name === commandName);
            if (!targetCommand) {
                this.context.channel.send(`${localization.commandNotFound(this.currentLanguage)} (${commandName})`);
            }
            else {
                this.context.channel.send([
                    ...buildCommandFullDescription(targetCommand, this.currentLanguage)
                ])
            }
        }
        else {
            this.context.channel.send([
                localization.availableCommands(this.currentLanguage),
                ...flatten(registeredCommands.map(c => buildCommandShortDescription(c, this.currentLanguage)))
            ])
        }
    }
}

function buildCommandShortDescription(command: Command, language: Language): string[] {
    return [
        bold(command.name),
        italic(command.description(language) ?? localization.noDescription(language))
    ]
}

function buildCommandFullDescription(command: Command, language: Language): string[] {
    return [
        ...buildCommandShortDescription(command, language),
        ...buildCommandUsageDescription(command, language)
    ]
}

function buildCommandUsageDescription(command: Command, language: Language): string[] {
    if (isAggregateCommand(command)) {
        return [
            localization.complexCommand(language),
            ...flatten(command.subCommands.map(c => buildCommandShortDescription(c, language))).map(d => `    ${d}`),
            localization.complexCommandHint(language, config.prefix, command.name, command.subCommands[0].name)
        ]
    }
    else {
        return [`${localization.usage(language)} ${code(formatArgumentsUsageHint(command, language))}`];
    }
}

function formatArgumentsUsageHint({ name, argumentsMap }: Command, language: Language) {
    return `${config.prefix} ${name} ${argumentsMap.map(a => `<${getArgumentName(a, language)}${getArgumentType(a, language)}>`).join(' ')}`;
}

function getArgumentName(arg: CommandArgumentMetadata, language: Language) {
    return arg.type === CommandArgumentType.mentions ? localization.mentions(language) : arg.name ?? arg.index;
}

function getArgumentType(arg: CommandArgumentMetadata, language: Language) {
    return arg.isRequired ? `:${localization.required(language)}` : `:${localization.optional(language)}`;
}


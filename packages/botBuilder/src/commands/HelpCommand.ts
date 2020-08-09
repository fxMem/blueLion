import { localization } from "./HelpCommandLocalization";
import { flatten, bold, italic, code } from "../common";
import { Language } from "../localization";
import { CommandBase } from "./CommandBase";
import { Command } from "./Command";
import { CommandArgument } from "./CommandArgument";
import { build, optional, CommandArgumentMetadata, CommandArgumentType } from "./CommandArgumentsMap";
import { isAggregateCommand } from "./AggregateCommand";

export class HelpCommand extends CommandBase {
    name = 'help';
    description = localization.description;

    argumentsMap = build([optional('commandNames').catchAll()]);

    constructor(private registeredCommands: Command[]) {
        super();
    }

    doInvoke(commandNames: CommandArgument[]) {
        const currentLanguage = this.currentLanguage;
        const rawCommandNames = commandNames.map(c => c.value);

        if (commandNames.length > 0) {
            const rootCommand = this.registeredCommands.find(c => c.name === rawCommandNames[0]);
            const targetCommand = findCommand(rootCommand, rawCommandNames, 1);
            this.commandContext.channel.send([
                ...this.buildCommandFullDescription(targetCommand, rawCommandNames.join(' '), this.currentLanguage, this.config.prefix)
            ]);
        }
        else {
            this.commandContext.channel.send([
                localization.availableCommands(this.currentLanguage),
                ...flatten(this.registeredCommands.map(c => this.buildCommandShortDescription(c, c.name, this.currentLanguage)))
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

    buildCommandShortDescription(command: Command, fullCommandPath: string, language: Language): string[] {
        return [
            bold(fullCommandPath),
            italic(command.description(language) ?? localization.noDescription(language))
        ]
    }
    
    buildCommandFullDescription(command: Command, fullCommandPath: string, language: Language, prefix: string): string[] {
        return [
            ...this.buildCommandShortDescription(command, fullCommandPath, language),
            ...this.buildCommandUsageDescription(command, fullCommandPath, language, prefix)
        ]
    }
    
    buildCommandUsageDescription(command: Command, fullCommandPath: string, language: Language, prefix: string): string[] {
        if (isAggregateCommand(command)) {
            return [
                localization.complexCommand(language),
                ...flatten(command.subCommands.map(c => this.buildCommandShortDescription(c, `${c.name}`, language))).map(d => `    ${d}`),
                localization.complexCommandHint(language, this.config.prefix, command.name, command.subCommands[0].name)
            ]
        }
        else {
            return [`${localization.usage(language)} ${code(this.formatArgumentsUsageHint(command, fullCommandPath, language, prefix))}`];
        }
    }
    
    formatArgumentsUsageHint({ name, argumentsMap }: Command, fullCommandPath: string, language: Language, prefix: string) {
        return `${prefix} ${fullCommandPath} ${argumentsMap.map(a => `<${this.getArgumentName(a, language)}${this.getArgumentType(a, language)}>`).join(' ')}`;
    }
    
    getArgumentName(arg: CommandArgumentMetadata, language: Language) {
        return arg.type === CommandArgumentType.mentions ? localization.mentions(language) : arg.name ?? arg.index;
    }
    
    getArgumentType(arg: CommandArgumentMetadata, language: Language) {
        return arg.isRequired ? `:${localization.required(language)}` : `:${localization.optional(language)}`;
    }
}




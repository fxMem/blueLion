import { Command } from "../Command";
import { optional, build, CommandArgumentMetadata, CommandArgumentType } from "../CommandArgumentsMap";
import { DiscordContext } from "../discord/DiscordContext";
import { registeredCommands } from "../RegisteredCommands";
import { MessageEmbed } from "discord.js";
import config from '.././config.json';

export class HelpCommand implements Command {
    name = 'help';
    description = 'Provides information about available commands'
    argumentsMap = build([optional('commandName')]);

    invoke(context: DiscordContext, commandName: string) {
        if (commandName) {

            const targetCommand = registeredCommands.find(c => c.name === commandName);
            if (!targetCommand) {
                context.channel.send(`Cannot find the command you've just requested! (${commandName})`);
            }
            else {
                context.channel.send(
                    new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(targetCommand.name)
                        .setDescription(targetCommand.description ?? 'This command has no description')
                        .addFields(
                            { name: 'Usage', value: formatArgumentsUsageHint(targetCommand) }
                        )
                )
            }
        }
        else {
            context.channel.send(
                new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Available commands')
                    .addFields(
                        registeredCommands.map(c => ({
                            name: c.name,
                            value: c.description ?? 'This command has no description'
                        }))
                    )
            )
        }
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
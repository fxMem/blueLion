import { InvocationContext } from "./CommandInfo";
import { CommandArgument } from "./CommandArgument";
import { Config } from "./Config";

const correctCharsRegex = RegExp('^[a-zA-Z 0-9_!?<>@]*$');

export class CommandParser {

    constructor(private config: Config) {

    }

    parse(message: string): InvocationContext {
        const commandStringPrefix = this.config.prefix + ' ';
        if (!message.startsWith(commandStringPrefix)) {
            return null;
        }

        if (!correctCharsRegex.test(message)) {
            throw new Error('Command contains incorrect symbols! Only letters, numbers, spaces, underscore (_), !, ? are allowed!');
        }
        
        const commandPayload = message.substring(commandStringPrefix.length);
        const firstSpaceIndex = commandPayload.indexOf(' ');
        if (firstSpaceIndex == -1) {
            return {
                name: commandPayload,
                arguments: []
            }
        }
        else {
            return {
                name: commandPayload.substr(0, firstSpaceIndex),
                arguments: this.parseArguments(commandPayload.substring(firstSpaceIndex + 1))
            }
        }
    }

    private parseArguments(rawArguments: string): CommandArgument[] {
        
        return rawArguments.split(' ').map((arg, index) => {
            const argumentValuePair = arg.split('=');
            if (argumentValuePair.length === 1) {
                return {
                    value: argumentValuePair[0],
                    index
                }
            }
            else if (argumentValuePair.length === 2) {
                return {
                    name: argumentValuePair[0],
                    value: argumentValuePair[1],
                    index
                }
            }
            else {
                throw new Error(`Incorrect argument ${arg}! Arguments must be specified in one of the folloing formats: 1. <argument value 1>, 2. <argument name>=<argument value>`);
            }
        });
    }
}
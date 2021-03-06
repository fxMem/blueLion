import { CommandArgument } from "./CommandArgument";

export enum CommandArgumentType {
    text,
    mentions
}

export type CommandArgumentMetadata = {
    type: CommandArgumentType
    name?: string;
    index: number;
    isRequired: boolean;
    isCatchAll: boolean;
}

export function build(argumentsMetadata: CommandArgumentMetadataBuilder[]): CommandArgumentMetadata[] {
    const allArguments = argumentsMetadata.map((builder, index) => builder.withIndex(index).metadata);

    checkThatCatchAllIsUsedOnceAndLast(allArguments);
    checkForOptionalUnnamedArguments(allArguments);
    checkForNameCollisions(allArguments);
    checkThatMentionIsUsedOnceAndLast(allArguments);

    return allArguments;
}

function checkThatMentionIsUsedOnceAndLast(args: CommandArgumentMetadata[]) {
    const mentionArg = args.filter(a => a.type === CommandArgumentType.mentions);
    if (mentionArg.length == 0) {
        return;
    }

    if (mentionArg.length > 1) {
        throw new Error('Command cannot have multiple mention arguments!');
    }

    if (mentionArg[0].index != args.length - 1) {
        throw new Error('Mention argument argument must be the last one!');
    }
}

function checkForOptionalUnnamedArguments(args: CommandArgumentMetadata[]) {
    const optionalUnnamedArgs = args.filter(a => !a.isRequired && !a.name && a.type !== CommandArgumentType.mentions);
    if (optionalUnnamedArgs.length > 0) {
        throw new Error('Unnamed optional args are not allowed!');
    }
}

function checkThatCatchAllIsUsedOnceAndLast(args: CommandArgumentMetadata[]) {
    const catchAllArg = args.filter(a => a.isCatchAll);
    if (catchAllArg.length == 0) {
        return;
    }

    if (catchAllArg.length > 1) {
        throw new Error('Command cannot have multiple catch all arguments!');
    }

    if (catchAllArg[0].index != args.length - 1) {
        throw new Error('Catch all argument must be the last one!');
    }
}

function checkForNameCollisions(args: CommandArgumentMetadata[]) {
    const allNames = args.filter(a => a.name).map(a => a.name);
    const uniqueNames = Array.from(new Set(allNames));
    if (allNames.length != uniqueNames.length) {
        throw new Error('Duplicate argument names are not allowed!');
    }
}

export class CommandArgumentMetadataBuilder {
    metadata: CommandArgumentMetadata;

    constructor() {
        this.metadata = {
            type: CommandArgumentType.text,
            index: -1,
            isRequired: true,
            isCatchAll: false
        }
    }

    mention(): this {
        this.metadata.type = CommandArgumentType.mentions;
        return this;
    }

    optional(): this {
        this.metadata.isRequired = false;
        return this;
    }

    required(): this {
        this.metadata.isRequired = true;
        return this;
    }

    withName(name: string): this {
        this.metadata.name = name;
        return this;
    }

    withIndex(index: number): this {
        this.metadata.index = index;
        return this;
    }

    catchAll(): this {
        this.metadata.isCatchAll = true;
        return this;
    }
}

export function optional(name: string): CommandArgumentMetadataBuilder {
    return new CommandArgumentMetadataBuilder()
        .withName(name)
        .optional();
}

export function required(name: string) {
    return new CommandArgumentMetadataBuilder()
        .withName(name)
        .required();
}

export function mention() {
    return unnamed().mention();
}

export function unnamed() {
    return new CommandArgumentMetadataBuilder();
}

export function resolveArguments(providedArguments: CommandArgument[], commandArgumentsMetadata: CommandArgumentMetadata[]): (string | CommandArgument[])[] {
    const mappedArguments: { [key: string]: boolean } = {};
    return commandArgumentsMetadata.map(requiredArgument => {
        const { name, index, isCatchAll, isRequired, type } = requiredArgument;

        // Mentions are retrieved from Discord message object directly anyway so we don't 
        // bother with it here
        if (type === CommandArgumentType.mentions) {
            return null;
        }

        const providedNamedArgument = providedArguments.find(
            providedArgument => providedArgument.name && providedArgument.name === name
        );

        if (providedNamedArgument) {
            mappedArguments[index] = true;
            return providedNamedArgument.value;
        }

        // Catch all arguments may only appear at the end of the list
        if (isCatchAll) {
            const catchedValues = [] as CommandArgument[];
            for (let providedArgumentIndex = 0; providedArgumentIndex < providedArguments.length; providedArgumentIndex++) {
                if (mappedArguments[providedArgumentIndex]) {
                    continue;
                }

                const providedArgument = providedArguments[providedArgumentIndex];
                catchedValues.push(providedArgument);
                mappedArguments[providedArgumentIndex] = true;
            }

            return catchedValues;
        }

        const providedArgumentByIndex = providedArguments.length > index ? providedArguments[index] : null;
        if (providedArgumentByIndex && !mappedArguments[index]) {
            mappedArguments[index] = true;
            return providedArgumentByIndex.value;
        }

        if (!isRequired) {
            return null;
        }

        throw new Error(`Value for required argument ${requiredArgument.name ?? requiredArgument.index} is not provided!`);
    });
}

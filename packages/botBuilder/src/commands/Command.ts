import { CommandArgumentMetadata, resolveArguments } from "./CommandArgumentsMap";
import { GuildContext } from "../discord/GuildContext";
import { CommandArgument } from "./CommandArgument";
import { LocalizedString } from "../localization/LocalizedString";
import { MessageContext } from "../discord/MessageContext";
import { GuildInitializerResult } from "../bootstrapper";
import { KeyValueStorage } from "../storage";
import { LanguageManager } from "../localization";
import { CommandContext } from "./CommandContext";
import { Config } from "../Config";

export interface Command {
    name: string;
    description?: LocalizedString;
    invoke(context: MessageContext, ...args: (string | CommandArgument[])[]): Promise<void> | void;
    argumentsMap: CommandArgumentMetadata[];
}

export function invokeCommand(
    command: Command,
    config: Config,
    providedArguments: CommandArgument[],
    messageContext: MessageContext,
    globalStorageInitializer: GuildInitializerResult<KeyValueStorage>,
    languageManagerInitializer: GuildInitializerResult<LanguageManager>
): Promise<Promise<void> | void> {

    return languageManagerInitializer.ensure(messageContext).then(languageManager => {
        return globalStorageInitializer.ensure(messageContext).then(storage => ({ storage, languageManager }));
    }).then(({ storage, languageManager }) => {

        const currentLanguage = languageManager.getCurrentLanguage();
        const commandContext: CommandContext = {
            ...messageContext,
            config,
            languageManager,
            storage,
            currentLanguage
        };
        return invokeCommandWithContext(command, providedArguments, commandContext);
    });
}

export function invokeCommandWithContext(
    command: Command,
    providedArguments: CommandArgument[],
    commandContext: CommandContext) {
    const resolvedArguments = resolveArguments(providedArguments, command.argumentsMap);
    return command.invoke.apply(command, [commandContext, ...resolvedArguments]);
}


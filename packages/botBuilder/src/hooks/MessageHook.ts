import { MessageContext } from "../discord";
import { RequiresGuildInitialization } from "../bootstrapper";

export type MessageHookFactory = () => MessageHook;

export type MessageHook = {
    run: (context: MessageContext) => Promise<void> | void;
} & RequiresGuildInitialization;

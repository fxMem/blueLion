import { MessageContext, GuildContext } from "../discord";
import { RequiresGuildInitialization, GuildSource } from "../bootstrapper";
import { MessageHook } from "./MessageHook";
import { createLocalLogScope } from "../log";

export class MessageHookInvoker implements RequiresGuildInitialization {
    private log = createLocalLogScope('MessageHookInvoker');
    private hooks: MessageHook[];
    name = "MessageHookInvoker";
    context: GuildContext;
    
    constructor(private registeredHooks: GuildSource<MessageHook>[]) {

    }

    initializeGuild() {
        return Promise.all(this.registeredHooks.map(h => h.ensure(this.context))).then(hooks => {
            this.hooks = hooks;
        });
    }

    invoke(context: MessageContext) {
        return Promise.all(this.hooks.map(h => h.run(context)));
    }
}


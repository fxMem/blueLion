import { User, TextChannel, DMChannel, NewsChannel, MessageMentions, Guild, EmojiIdentifierResolvable, MessageReaction, StringResolvable, MessageOptions, MessageAdditions, Message, SplitOptions, APIMessage } from "discord.js";
import { GuildContext } from "./GuildContext";

export type MessageContext = {
    author: User;
    channel: TextChannel | DMChannel | NewsChannel;
    mentions: MessageMentions;

    react(emoji: EmojiIdentifierResolvable): Promise<MessageReaction>;
    reply(
        content?: StringResolvable,
        options?: MessageOptions | MessageAdditions | (MessageOptions & { split?: false }) | MessageAdditions,
    ): Promise<Message>;
    reply(
        content?: StringResolvable,
        options?: (MessageOptions & { split: true | SplitOptions }) | MessageAdditions,
    ): Promise<Message[]>;
    reply(
        options?:
            | MessageOptions
            | MessageAdditions
            | APIMessage
            | (MessageOptions & { split?: false })
            | MessageAdditions
            | APIMessage,
    ): Promise<Message>;
    reply(
        options?: (MessageOptions & { split: true | SplitOptions }) | MessageAdditions | APIMessage,
    ): Promise<Message[]>;
} & GuildContext;
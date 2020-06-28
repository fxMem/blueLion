import { User, TextChannel, DMChannel, NewsChannel, MessageMentions, EmojiIdentifierResolvable, MessageReaction, StringResolvable, MessageOptions, MessageAdditions, Message, SplitOptions, APIMessage, Guild } from "discord.js";

export type GuildContext = {
    author: User;
    channel: TextChannel | DMChannel | NewsChannel;
    mentions: MessageMentions;

    guild: Guild;

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
}
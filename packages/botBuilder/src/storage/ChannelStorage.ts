import { KeyValueStorage } from "./KeyValueStorage";
import { GuildContext } from "../discord/GuildContext";
import { registerForGuildInitialization, GuildInitializerResult } from "../bootstrapper/GuildBootstrapper";
import { TextChannel, Message, Snowflake, Collection } from "discord.js";
import { tryCreateCategory, tryCreateTextChannel } from "../common/ChannelsHelper";
import { RequiresGuildInitialization, registerClassInitializer } from "../bootstrapper/RequiresGuildInitialization";
import { Config } from "../Config";

let setInitialized: () => void;
const initialized = new Promise<void>((resolve, reject) => {
    setInitialized = resolve;
});

type KeyRef = {
    key: string;
} & MessageRef;

type MessageRef = {
    id: Snowflake;
    pinId: Snowflake;
}

type StoredData = {
    id: string,
    value: string
};

const messageCharactersLimit = 2000;


export class ChannelStorage implements KeyValueStorage, RequiresGuildInitialization {
    context: GuildContext;
    private channel: TextChannel;
    private lookup: { [key: string]: MessageRef };
    private pins: Snowflake[];

    constructor(
        private channelName: string,
        private config: Config
    ) {

    }

    initializeGuild(): Promise<void> {
        const { guild } = this.context;
        if (!guild.available) {
            throw new Error(`Guild is not available!`);
        }

        return tryCreateCategory({ guild, name: `${this.config.name}-system` })
            .then(category => {
                return tryCreateTextChannel({ guild, name: this.channelName, hidden: true, parent: category.id })
            }).then(storageChannel => {
                this.channel = storageChannel;
                return this.channel.messages.fetchPinned(true);
            }).then((pins) => {
                this.lookup = this.getLookup(pins);
                this.pins = Object.values(this.lookup).map(r => r.pinId);
                setInitialized();
            });
    }

    get<T>(key: string, reviver?: (data: string) => T): Promise<T> {
        reviver = reviver || JSON.parse;
        return initialized.then(() => {
            const ref = this.lookup[key];
            if (!ref) {
                return null;
            }

            return this.channel.messages.fetch(ref.id).then(message => {
                const data = JSON.parse(message.content) as StoredData;
                if (data.id !== key) {
                    throw new Error(`Possible data corruption for stored key ${key}`);
                }

                return reviver(data.value);
            });
        })
    }

    set(key: string, value: any): Promise<void> {
        return initialized.then(() => {
            const ref = this.lookup[key];
            return ref
                ? this.updateValue(ref, key, value)
                : this.addNew(key, value);
        });
    }

    delete(key: string): Promise<void> {
        let ref: MessageRef;
        return initialized.then(() => {
            ref = this.lookup[key];
            if (!ref) {
                return;
            }

            return this.channel.messages.fetch(ref.pinId);
        }).then(pin => {
            return this.updatePin(pin, refs => refs.filter(r => r.key !== key));
        }).then(pin => {
            return this.channel.messages.fetch(ref.id);
        }).then(message => {
            return message.delete().then();
        });
    }

    private updateValue(messageRef: MessageRef, key: string, value: any) {
        this.channel.messages.fetch(messageRef.id).then(message => {
            const newContent = this.buildMessageToStore(key, value);
            if (newContent.length > messageCharactersLimit) {
                throw new Error(`Cannot update value with key ${key}: it's too big!`);
            }

            return message.edit(newContent);
        });
    }

    private addNew(key: string, value: any): Promise<void> {
        const getRequiredSpace = (pinId: Snowflake) => JSON.stringify(this.buildKeyRef(pinId, id, key)).length + 10;
        const update = (pin: Message): Promise<Message> => this.updatePin(pin, refs => [...refs, this.buildKeyRef(pin.id, id, key)]);
        const allocateNew = () => this.channel.send(JSON.stringify([])).then(message => {
            return message.pin();
        }).then(pin => {
            this.pins.push(pin.id);
            return update(pin);
        });

        let id: Snowflake = null;

        // Sending message with value and only after that updating pins lookup is important. It ensures
        // that data will be present in case of network problem. Worst case is we'll lose the pin update and end up
        // with 'trash' value messages not linked to any pin. TODO: add some sort of cleaning routine 
        // to detect and remove such messages.
        return this.channel.send(this.buildMessageToStore(key, value)).then(message => {
            id = message.id;
            return this.channel.messages.fetchPinned(true);
        }).then(pins => {

            const freePin = pins.find(p => p.content.length + getRequiredSpace(p.id) < messageCharactersLimit);
            const pin = freePin
                ? update(freePin)
                : allocateNew();

            return pin.then(p => {
                this.lookup[key] = { id, pinId: p.id };
            });
        });
    }

    private updatePin(pin: Message, updater: (refs: KeyRef[]) => KeyRef[]): Promise<Message> {
        const existingData = JSON.parse(pin.content) as KeyRef[];

        return pin.edit(JSON.stringify(updater(existingData)));
    }

    private getLookup(pinnedMessages: Collection<Snowflake, Message>) {
        const lookup: { [key: string]: MessageRef } = {};
        pinnedMessages.forEach(pin => {
            const data = JSON.parse(pin.content) as KeyRef[];
            for (const ref of data) {
                lookup[ref.key] = { id: ref.id, pinId: pin.id };
            }
        });

        return lookup;
    }

    private buildMessageToStore(key: string, value: any): string {
        return JSON.stringify({
            id: key,
            value: JSON.stringify(value)
        } as StoredData);
    }

    private buildKeyRef(pinId: Snowflake, id: Snowflake, key: string): KeyRef {
        return {
            id,
            pinId,
            key
        };
    }
}


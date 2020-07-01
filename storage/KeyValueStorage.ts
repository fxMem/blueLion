export interface KeyValueStorage {
    get<T>(key: string, reviver?: (data: string) => T): Promise<T>;
    set(key: string, value: any): Promise<void>;
    delete(key: string): Promise<void>;
};
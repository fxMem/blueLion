export type PromiseSource<T> = {
    promise: Promise<T>;
    done: boolean;
    error?: any;
    resolve: (value: T) => void;
    reject: (error: any) => void;
};

export function createPromiseSource<T>(): PromiseSource<T> {
    const promiseSource: any = {
        done: false
    };

    promiseSource.promise = new Promise<T>((resolveCallback, rejectCallback) => {
        promiseSource.resolve = (value: T) => { promiseSource.done = true; resolveCallback(value); };
        promiseSource.reject = (error) => { 
            promiseSource.done = true; 
            promiseSource.error = error;
            rejectCallback(error); 
        };
    });

    return promiseSource;
}
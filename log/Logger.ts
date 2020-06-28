export enum LogLevel {
    verbose,
    warn,
    error, 
    fatal
}

export class Log {

    constructor(private loggers: Logger[]) {

    }

    info(message: string): void {
        this.log(message, LogLevel.verbose);
    }

    warn(message: string): void {
        this.log(message, LogLevel.warn);
    }

    error(message: string): void {
        this.log(message, LogLevel.error);
    }

    fatal(message: string): void {
        this.log(message, LogLevel.fatal);
    }

    // Simple realization just delegates
    // TODO: make it queue-style
    log(message: string, level: LogLevel): void {
        this.loggers.forEach(l => l.log(level, message));
    }

    createScope(name: string): ScopedLogger {
        return new ScopedLogger(this.loggers, name);
    }
}

export class ScopedLogger extends Log {
    private created: Date;

    constructor(loggers: Logger[], private name: string) {
        super(loggers);

        if (!name) {
            throw new Error('Cannot create logger scope with empty name!');
        }

        this.created = new Date();
        this.info(`Scope entered!`);
    }

    createScope(name: string): ScopedLogger {
        return super.createScope(`${this.name}.${name}`);
    }

    log(message: string, level: LogLevel): void {
        super.log(`${this.name}: ${message}`, level);
    }

    close(): void {
        let totalTime = new Date((new Date() as any - (this.created as any)));
        this.info(`Scope exited, totalTime = ${totalTime}`);
    }
}

export interface Logger {
    log(level: LogLevel, message: string);
}

export class DefaultConsoleLogger implements Logger {

    log(level: LogLevel, message: string) {
        console.log(`${(new Date().toTimeString())} :: [${LogLevel[level]}] - ${message}`);
    }
}
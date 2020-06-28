import { ScopedLogger, Log } from "./Logger";

let loggerScopeStack = [];

function getStack(): Log[] {
    if (loggerScopeStack.length === 0) {
        throw new Error('Have to initialize scoped logging first, call initializeLogger');
    }

    return loggerScopeStack;
}
export function initializeLogger(rootLogger: Log) {
    if (loggerScopeStack.length !== 0) {
        throw new Error('Initializing logger may be done only once!');
    }

    loggerScopeStack.push(rootLogger);
}

export function getCurrentScope(): Log {
    let stack = getStack();
    return stack[stack.length - 1];
}

export function createLocalLogScope(name: string): ScopedLogger {
    return getCurrentScope().createScope(name);
}

export function enterGlobalLogScope(name: string): ScopedLogger {
    let stack = getStack();
    let currentScope = getCurrentScope();
    let newScope = currentScope.createScope(name);
    stack.push(newScope);

    return newScope;
}

export function exitLogScope(): void {
    let stack = getStack();
    if (stack.length > 1) {
        stack.pop();
    }
}
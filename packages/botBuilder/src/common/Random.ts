export function getRandomIntFromInterval(from: number, to: number): number {
    if (from >= to) {
        throw new Error(`From argument cannot be greater or eqial To argument!`);
    }

    return from + Math.trunc(Math.random() * (to + 1 - from));
}
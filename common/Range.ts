export function range(amount: number) {
    return Array.apply(null, Array(amount)).map((_, i) => i);
}

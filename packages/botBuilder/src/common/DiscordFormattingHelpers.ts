export function bold(message: string) {
    return `**${message}**`;
}

export function italic(message: string) {
    return `*${message}*`;
}

export function code(message: string) {
    return `\`${message}\``;
}

export function cssRed(message: string) {
    return [`[${message}]`];
}

export function asciiRed(message: string) {
    return [`[${message}]`];
}

export function cssGreen(message: string) {
    return [`"${message}"`];
}

export function cssBlue(message: string) {
    return [`.${message}`];
}

export function asciiBlue(message: string) {
    return [`= ${message} =`];
}

export function blueLine(message: string) {
    return ['```ini', `[${message}]`, '```'];
}

export function redLine(message: string) {
    return ['```css', `[${message}]`, '```'];
}

export function greenLine(message: string) {
    return ['```bash', `"${message}"`, '```'];
}


export function formatCss(lines: string[]) {
    return ['```css', ...lines, '```'];
}

export function formatAscii(lines: string[]) {
    return ['```asciidoc', ...lines, '```'];
}
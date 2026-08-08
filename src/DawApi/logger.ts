/**
 * Minimal replacement for @overnightjs/logger, which has been unmaintained
 * since ~2020 and was the last thing keeping that dependency around. Same
 * three levels the codebase used, same coloured output.
 */
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

/**
 * Log lines can carry user input (a request param, a filename), so strip CR/LF
 * before writing: otherwise a crafted value can forge extra log entries.
 */
const oneLine = (message: unknown): string => {
    const text = message instanceof Error ? message.stack || message.message : String(message);
    return text.replace(/[\r\n]+/g, ' ');
};

export const Logger = {
    /** "Important": server lifecycle messages. */
    Imp(message: unknown): void {
        console.log(GREEN + oneLine(message) + RESET);
    },
    Info(message: unknown): void {
        console.log(CYAN + oneLine(message) + RESET);
    },
    Err(error: unknown): void {
        console.error(RED + oneLine(error) + RESET);
    },
};

export default Logger;

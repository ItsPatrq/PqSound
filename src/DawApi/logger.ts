/**
 * Minimal replacement for @overnightjs/logger, which has been unmaintained
 * since ~2020 and was the last thing keeping that dependency around. Same
 * three levels the codebase used, same coloured output.
 */
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

export const Logger = {
    /** "Important": server lifecycle messages. */
    Imp(message: unknown): void {
        console.log(GREEN + String(message) + RESET);
    },
    Info(message: unknown): void {
        console.log(CYAN + String(message) + RESET);
    },
    Err(error: unknown): void {
        console.error(RED + (error instanceof Error ? error.stack || error.message : String(error)) + RESET);
    },
};

export default Logger;

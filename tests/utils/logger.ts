export class Logger {
    private className: string;

    constructor(className: string) {
        this.className = className;
    }

    private formatMessage(level: string, message: string): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${this.className}] [${level}] ${message}`;
    }

    info(message: string): void {
        console.log(this.formatMessage('INFO', message));
    }

    debug(message: string): void {
        console.debug(this.formatMessage('DEBUG', message));
    }

    warn(message: string): void {
        console.warn(this.formatMessage('WARN', message));
    }

    error(message: string): void {
        console.error(this.formatMessage('ERROR', message));
    }
}

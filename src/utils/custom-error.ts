export class CustomError extends Error {
    constructor(message: string, public statusCode = 500) {
        super(message);
        this.name = this.constructor.name;
    }
}

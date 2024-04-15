export class UnauthorizedError extends Error {
    constructor(message = 'You are Unauthorized') {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = 401;

    }
}
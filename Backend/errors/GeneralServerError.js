export class GeneralServerError extends Error {
    constructor(message = 'Internal server error') {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = 500;
    }
}
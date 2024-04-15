export class DataNotFoundError extends Error {
    constructor(message = 'The data you are looking for is not found') {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = 404; // not found
    }
}
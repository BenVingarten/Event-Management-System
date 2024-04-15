export class DuplicateUsernameError extends Error {
    constructor(message = 'There is already a user with that username') {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = 409; // Conflict status code

    }
}
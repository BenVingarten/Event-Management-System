export class DuplicateDataError extends Error {
  constructor(message = "that data already exists") {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = 409; // Conflict status code
  }
}

export class InvalidFieldModifyError extends Error {
  constructor(message = "Invalid field modification") {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = 400;
  }
}

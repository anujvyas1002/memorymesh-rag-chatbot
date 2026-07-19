export class AppException extends Error {
  public readonly statusCode: number;

  public readonly details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = 'AppException';
    this.statusCode = statusCode;
    this.details = details;
  }
}

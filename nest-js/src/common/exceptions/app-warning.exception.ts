export class AppWarningException extends Error {
  public readonly statusCode: number;

  public readonly details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = 'AppWarningException';
    this.statusCode = statusCode;
    this.details = details;
  }
}

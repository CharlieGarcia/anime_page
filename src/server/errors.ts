// An error an API route turns into a JSON response with this status.
// fieldErrors maps a form field to the message to show under it.
export class HttpError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

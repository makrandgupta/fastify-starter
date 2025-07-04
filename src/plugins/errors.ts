// Generic error class for API validation errors
export class ApiValidationError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'ApiValidationError';
    this.statusCode = statusCode;
  }
} 
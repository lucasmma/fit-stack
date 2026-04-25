import "server-only";
import type { HttpResponse } from "@/server/shared/presentation/protocols/http";

export const ok = <T>(body: T): HttpResponse<T> => ({ statusCode: 200, body });
export const created = <T>(body: T): HttpResponse<T> => ({ statusCode: 201, body });
export const noContent = (): HttpResponse<null> => ({ statusCode: 204, body: null });

export const badRequest = (message: string, issues?: unknown): HttpResponse =>
  errorResponse(400, "BAD_REQUEST", message, issues);

export const unauthorized = (message = "Unauthorized"): HttpResponse =>
  errorResponse(401, "UNAUTHENTICATED", message);

export const forbidden = (message = "Forbidden"): HttpResponse =>
  errorResponse(403, "FORBIDDEN", message);

export const notFound = (message = "Not found"): HttpResponse =>
  errorResponse(404, "NOT_FOUND", message);

export const conflict = (message: string): HttpResponse =>
  errorResponse(409, "CONFLICT", message);

export const tooManyRequests = (message = "Too many requests"): HttpResponse =>
  errorResponse(429, "TOO_MANY_REQUESTS", message);

export const serverError = (message = "Internal server error"): HttpResponse =>
  errorResponse(500, "INTERNAL", message);

function errorResponse(statusCode: number, code: string, message: string, issues?: unknown) {
  return {
    statusCode,
    body: { code, message, ...(issues ? { issues } : {}) },
  };
}

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly issues?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errors = {
  notFound: (message = "Not found") => new AppError(404, "NOT_FOUND", message),
  forbidden: (message = "Forbidden") => new AppError(403, "FORBIDDEN", message),
  conflict: (message: string) => new AppError(409, "CONFLICT", message),
  badRequest: (message: string, issues?: unknown) =>
    new AppError(400, "BAD_REQUEST", message, issues),
};

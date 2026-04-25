import "server-only";
import { errors } from "./http";

/**
 * Throws 404 when `value` is nullish. Use in data-layer callers so controllers
 * can stay declarative.
 */
export function assertExists<T>(value: T | null | undefined, message = "Not found"): T {
  if (value === null || value === undefined) {
    throw errors.notFound(message);
  }
  return value;
}

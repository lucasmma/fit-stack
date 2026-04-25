import { Prisma } from "@prisma/client";

/**
 * Convert Prisma Decimal (or similar) to a plain number safely. Use at the
 * data-layer boundary so Decimal objects never leak into the controller layer.
 */
export function toNumber(value: Prisma.Decimal | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  return Number(value.toString());
}

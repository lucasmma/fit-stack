import "server-only";

type Fields = Record<string, unknown> | undefined;

const REDACT_KEYS = new Set([
  "authorization",
  "cookie",
  "password",
  "token",
  "access_token",
  "refresh_token",
  "service_role_key",
  "aws_access_key_id",
  "aws_secret_access_key",
]);

function redact(fields: Fields): Fields {
  if (!fields) return fields;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (REDACT_KEYS.has(key.toLowerCase())) {
      out[key] = "[redacted]";
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = redact(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function emit(level: "info" | "warn" | "error" | "debug", msg: string, fields?: Fields) {
  const payload = {
    level,
    msg,
    timestamp: new Date().toISOString(),
    ...redact(fields),
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  debug: (msg: string, fields?: Fields) => emit("debug", msg, fields),
  info: (msg: string, fields?: Fields) => emit("info", msg, fields),
  warn: (msg: string, fields?: Fields) => emit("warn", msg, fields),
  error: (msg: string, fields?: Fields) => emit("error", msg, fields),
};

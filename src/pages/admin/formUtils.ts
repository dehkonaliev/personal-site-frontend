import type { AdminRow } from "../../lib/adminApi";
import type { FieldDef } from "./types";

export function buildPayload(fields: FieldDef[], form: AdminRow): AdminRow {
  const payload: AdminRow = {};
  for (const field of fields) {
    const value = form[field.name];
    if (field.type === "file") {
      if (typeof value === "string" && value) payload[field.name] = value;
      continue;
    }
    if (field.type === "number" || (field.type === "select" && field.numeric)) {
      const numeric = Number(value);
      payload[field.name] = Number.isFinite(numeric) ? numeric : 0;
      continue;
    }
    if (field.type === "checkbox") {
      payload[field.name] = value === true;
      continue;
    }
    if (field.type === "multiselect") {
      payload[field.name] = Array.isArray(value) ? value.map(Number) : [];
      continue;
    }
    payload[field.name] = value ?? "";
  }
  return payload;
}

export function valuesFromRow(
  fields: FieldDef[],
  row: AdminRow,
): { values: AdminRow; previews: Record<string, string> } {
  const values: AdminRow = { ...row };
  const previews: Record<string, string> = {};
  for (const field of fields) {
    if (field.type === "file") {
      previews[field.name] =
        typeof row[field.name] === "string" ? (row[field.name] as string) : "";
      values[field.name] = "";
    }
  }
  return { values, previews };
}

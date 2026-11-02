import type { AdminRow } from "../../lib/adminApi";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "checkbox"
  | "select"
  | "multiselect"
  | "email"
  | "url"
  | "file";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  wide?: boolean;
  rows?: number;
  accept?: string;
  folder?: string;
  options?: SelectOption[];
  optionsFrom?: "skillTypes" | "technologies";
  numeric?: boolean;
  maxLength?: number;
  min?: number;
}

export type ColumnKind = "text" | "boolean" | "date" | "count";

export interface ColumnDef {
  key: string;
  label: string;
  kind?: ColumnKind;
}

export interface ResourceDef {
  key: string;
  label: string;
  singular: string;
  path: string;
  description: string;
  columns: ColumnDef[];
  fields: FieldDef[];
  defaults: AdminRow;
  translationFields?: string[];
  relations?: Array<"skillTypes" | "technologies">;
  transform?: (row: AdminRow) => AdminRow;
  toPayload?: (payload: AdminRow) => AdminRow;
}

export function relationIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "number") return item;
      if (item && typeof item === "object" && "id" in item) {
        return Number((item as { id: unknown }).id);
      }
      return Number(item);
    })
    .filter((id) => Number.isFinite(id));
}

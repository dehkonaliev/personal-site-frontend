import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Languages,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import {
  adminApi,
  errorMessage,
  type AdminRow,
} from "../../lib/adminApi";
import { FieldInput } from "./FormFields";
import TranslationEditor from "./TranslationEditor";
import { buildPayload, valuesFromRow } from "./formUtils";
import type {
  ColumnDef,
  ResourceDef,
  SelectOption,
} from "./types";

export default function ResourcePage({ resource }: { resource: ResourceDef }) {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRow | null>(null);
  const [translating, setTranslating] = useState<AdminRow | null>(null);
  const [skillTypes, setSkillTypes] = useState<SelectOption[]>([]);
  const [technologies, setTechnologies] = useState<SelectOption[]>([]);

  const load = useCallback(
    async (showSpinner = false) => {
      if (showSpinner) {
        setLoading(true);
        setError("");
      }
      try {
        setRows(await adminApi.list(resource.path));
        setError("");
      } catch (loadError) {
        setError(errorMessage(loadError));
      } finally {
        setLoading(false);
      }
    },
    [resource.path],
  );

  useEffect(() => {
    let active = true;

    async function initialLoad() {
      try {
        const data = await adminApi.list(resource.path);
        if (!active) return;
        setRows(data);
        setError("");
      } catch (loadError) {
        if (active) setError(errorMessage(loadError));
      } finally {
        if (active) setLoading(false);
      }
    }

    void initialLoad();
    return () => {
      active = false;
    };
  }, [resource.path]);

  useEffect(() => {
    const sources = resource.relations;
    if (!sources) return;
    const relations = sources;
    let active = true;

    async function loadOptions() {
      const entries = await Promise.all(
        relations.map(async (source) => {
          const path = source === "skillTypes" ? "skill-types" : "technologies";
          const data = await adminApi.list(path);
          const options: SelectOption[] = data.map((row) => ({
            value: Number(row.id),
            label: String(row.name ?? ""),
          }));
          return [source, options] as const;
        }),
      );
      if (!active) return;
      for (const [source, options] of entries) {
        if (source === "skillTypes") setSkillTypes(options);
        else setTechnologies(options);
      }
    }

    loadOptions().catch(() => undefined);
    return () => {
      active = false;
    };
  }, [resource.relations]);

  function optionsFor(fieldName: string, source?: "skillTypes" | "technologies") {
    if (source === "skillTypes") return skillTypes;
    if (source === "technologies") return technologies;
    const field = resource.fields.find((item) => item.name === fieldName);
    return field?.options ?? [];
  }

  function openCreate() {
    setEditing(null);
    setEditorOpen(true);
    setNotice("");
  }

  function openEdit(row: AdminRow) {
    setEditing(row);
    setEditorOpen(true);
    setNotice("");
  }

  async function handleDelete(row: AdminRow) {
    const id = Number(row.id);
    if (!Number.isFinite(id)) return;
    if (!window.confirm(`Delete this ${resource.singular.toLowerCase()}?`)) {
      return;
    }
    setError("");
    setNotice("");
    try {
      await adminApi.remove(resource.path, id);
      setNotice(`${resource.singular} deleted.`);
      await load();
    } catch (deleteError) {
      setError(errorMessage(deleteError));
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl">{resource.label}</h1>
          <p className="mt-1 max-w-xl text-sm text-slate">{resource.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load(true)}
            className="inline-flex items-center gap-1.5 border border-line px-3 py-2 text-xs text-slate hover:border-ink hover:text-ink"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 bg-ink px-4 py-2 text-xs text-paper hover:bg-signal"
          >
            <Plus size={14} /> Add {resource.singular.toLowerCase()}
          </button>
        </div>
      </div>

      {notice && (
        <div className="mt-4 flex items-center gap-2 border border-signal/30 bg-signal/5 px-3 py-2 text-sm text-signal">
          <CheckCircle2 size={15} /> {notice}
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-center gap-2 border border-danger-line bg-danger-surface px-3 py-2 text-sm text-danger">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-line/30">
              {resource.columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={resource.columns.length + 1}
                  className="px-4 py-10 text-center text-slate"
                >
                  <Loader2 size={18} className="mx-auto animate-spin" />
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={resource.columns.length + 1}
                  className="px-4 py-10 text-center text-slate"
                >
                  Nothing here yet.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row, index) => (
                <tr
                  key={String(row.id ?? index)}
                  className="border-b border-line/70 last:border-0 hover:bg-line/10"
                >
                  {resource.columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 align-top">
                      <Cell row={row} column={column} />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right align-top">
                    <div className="inline-flex items-center gap-1">
                      {resource.translationFields &&
                        resource.translationFields.length > 0 &&
                        typeof row.id === "number" && (
                          <button
                            type="button"
                            onClick={() => {
                              setTranslating(row);
                              setNotice("");
                            }}
                            aria-label="Translations"
                            title="Manage translations"
                            className="border border-line p-1.5 text-slate hover:border-signal hover:text-signal"
                          >
                            <Languages size={14} />
                          </button>
                        )}
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        aria-label="Edit"
                        className="border border-line p-1.5 text-slate hover:border-ink hover:text-ink"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(row)}
                        aria-label="Delete"
                        className="border border-line p-1.5 text-slate hover:border-danger hover:text-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {editorOpen && (
        <ResourceForm
          key={editing ? String(editing.id) : "new"}
          resource={resource}
          initial={editing}
          optionsFor={optionsFor}
          onClose={() => setEditorOpen(false)}
          onSaved={async (message) => {
            setEditorOpen(false);
            setNotice(message);
            await load();
          }}
        />
      )}

      {translating &&
        resource.translationFields &&
        typeof translating.id === "number" && (
          <TranslationEditor
            resource={resource.key}
            objectId={translating.id}
            fields={resource.fields.filter((field) =>
              resource.translationFields?.includes(field.name),
            )}
            base={translating}
            onClose={() => setTranslating(null)}
            onSaved={(message) => {
              setTranslating(null);
              setNotice(message);
            }}
          />
        )}
    </section>
  );
}

function Cell({ row, column }: { row: AdminRow; column: ColumnDef }) {
  const value = row[column.key];
  if (column.kind === "boolean") {
    const published = value === true;
    return (
      <span className={published ? "text-signal" : "text-slate"}>
        {published ? "Published" : "Draft"}
      </span>
    );
  }
  if (column.kind === "count") {
    return <span>{Array.isArray(value) ? value.length : 0}</span>;
  }
  if (column.kind === "date" && typeof value === "string" && value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return (
        <span>
          {date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          })}
        </span>
      );
    }
  }
  if (typeof value === "string" && value) return <span>{value}</span>;
  if (typeof value === "number") return <span>{value}</span>;
  return <span className="text-slate/60">—</span>;
}

interface ResourceFormProps {
  resource: ResourceDef;
  initial: AdminRow | null;
  optionsFor: (
    fieldName: string,
    source?: "skillTypes" | "technologies",
  ) => SelectOption[];
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
}

function ResourceForm({
  resource,
  initial,
  optionsFor,
  onClose,
  onSaved,
}: ResourceFormProps) {
  const base = initial
    ? resource.transform
      ? resource.transform(initial)
      : { ...initial }
    : {};

  const [form, setForm] = useState<AdminRow>(() => ({
    ...resource.defaults,
    ...valuesFromRow(resource.fields, base).values,
  }));
  const [previews, setPreviews] = useState<Record<string, string>>(
    () => valuesFromRow(resource.fields, base).previews,
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  function setField(name: string, value: unknown) {
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleFileUploaded(name: string, path: string, url: string) {
    setForm((previous) => ({ ...previous, [name]: path }));
    setPreviews((previous) => ({ ...previous, [name]: url }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");

    let payload = buildPayload(resource.fields, form);
    if (resource.toPayload) payload = resource.toPayload(payload);

    try {
      if (initial && typeof initial.id === "number") {
        await adminApi.update(resource.path, initial.id, payload);
      } else {
        await adminApi.create(resource.path, payload);
      }
      await onSaved(
        initial
          ? `${resource.singular} updated.`
          : `${resource.singular} created.`,
      );
    } catch (submitError) {
      setFormError(errorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-line bg-paper p-6 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="font-display text-xl">
              {initial ? `Edit ${resource.singular}` : `New ${resource.singular}`}
            </h2>
            <p className="mt-1 text-xs text-slate">{resource.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="border border-line p-1.5 text-slate hover:border-ink hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        {formError && (
          <div className="mb-4 flex items-start gap-2 border border-danger-line bg-danger-surface px-3 py-2 text-sm text-danger">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-4 sm:grid-cols-2">
            {resource.fields.map((field) => (
              <FieldInput
                key={field.name}
                field={field}
                value={form[field.name]}
                options={optionsFor(field.name, field.optionsFrom)}
                preview={previews[field.name]}
                onChange={(value) => setField(field.name, value)}
                onFileUploaded={handleFileUploaded}
              />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-end gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-line px-4 py-2 text-sm text-slate hover:border-ink hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-ink px-5 py-2 text-sm text-paper hover:bg-signal disabled:opacity-60"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {initial ? "Save changes" : `Create ${resource.singular.toLowerCase()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

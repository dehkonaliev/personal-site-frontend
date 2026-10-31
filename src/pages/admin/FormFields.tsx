import { useRef, useState } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { adminApi, errorMessage } from "../../lib/adminApi";
import type { FieldDef, SelectOption } from "./types";

const inputClass =
  "w-full border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-slate/60 focus:border-signal focus:outline-none";

interface FieldInputProps {
  field: FieldDef;
  value: unknown;
  options: SelectOption[];
  preview?: string;
  onChange: (value: unknown) => void;
  onFileUploaded: (name: string, path: string, url: string) => void;
}

export function FieldInput({
  field,
  value,
  options,
  preview,
  onChange,
  onFileUploaded,
}: FieldInputProps) {
  const id = `admin-field-${field.name}`;

  let control;
  if (field.type === "file") {
    control = (
      <FileControl
        field={field}
        preview={preview}
        onFileUploaded={onFileUploaded}
      />
    );
  } else if (field.type === "textarea") {
    control = (
      <textarea
        id={id}
        className={inputClass}
        rows={field.rows ?? 4}
        required={field.required}
        maxLength={field.maxLength}
        placeholder={field.placeholder}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  } else if (field.type === "checkbox") {
    control = (
      <label className="flex cursor-pointer items-center gap-2 border border-line bg-paper px-3 py-2.5 text-sm">
        <input
          id={id}
          type="checkbox"
          className="h-4 w-4 accent-signal"
          checked={value === true}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="text-slate">
          {value === true ? "Yes" : "No"} — {field.label}
        </span>
      </label>
    );
  } else if (field.type === "select") {
    control = (
      <select
        id={id}
        className={inputClass}
        required={field.required}
        value={typeof value === "number" ? String(value) : String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select…</option>
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else if (field.type === "multiselect") {
    const selected = Array.isArray(value) ? value.map(Number) : [];
    control = (
      <div className="flex flex-wrap gap-2 border border-line bg-paper p-3">
        {options.length === 0 && (
          <span className="text-sm text-slate">No options available yet.</span>
        )}
        {options.map((option) => {
          const optionValue = Number(option.value);
          const active = selected.includes(optionValue);
          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() =>
                onChange(
                  active
                    ? selected.filter((item) => item !== optionValue)
                    : [...selected, optionValue],
                )
              }
              className={`border px-2.5 py-1 text-xs transition-colors ${
                active
                  ? "border-signal bg-signal text-paper"
                  : "border-line text-slate hover:border-signal"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  } else {
    control = (
      <input
        id={id}
        type={field.type}
        className={inputClass}
        required={field.required}
        maxLength={field.maxLength}
        min={field.min}
        placeholder={field.placeholder}
        value={
          typeof value === "number" || typeof value === "string"
            ? String(value)
            : ""
        }
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <div className={field.wide ? "sm:col-span-2" : undefined}>
      <label
        htmlFor={field.type === "file" || field.type === "multiselect" ? undefined : id}
        className="mb-1.5 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate"
      >
        {field.label}
        {field.required && <span className="text-signal">*</span>}
      </label>
      {control}
      {field.help && (
        <p className="mt-1 text-xs leading-relaxed text-slate/80">{field.help}</p>
      )}
    </div>
  );
}

interface FileControlProps {
  field: FieldDef;
  preview?: string;
  onFileUploaded: (name: string, path: string, url: string) => void;
}

function FileControl({ field, preview, onFileUploaded }: FileControlProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await adminApi.upload(file, field.folder ?? "uploads");
      onFileUploaded(field.name, uploaded.path, uploaded.url);
    } catch (uploadError) {
      setError(errorMessage(uploadError));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const isImage = preview && field.accept?.includes("image");

  return (
    <div className="border border-line bg-paper p-3">
      <div className="flex items-center gap-3">
        {isImage ? (
          <img
            src={preview}
            alt=""
            className="h-14 w-14 border border-line object-cover"
          />
        ) : preview ? (
          <a
            href={preview}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-signal hover:underline"
          >
            <FileText size={15} /> View current file
          </a>
        ) : (
          <span className="text-sm text-slate">No file uploaded.</span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={field.accept}
            className="hidden"
            onChange={(event) => void handleChange(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 border border-line px-3 py-1.5 text-xs hover:border-ink disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Upload size={13} />
            )}
            {uploading ? "Uploading…" : preview ? "Replace" : "Upload"}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}

import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Languages, Loader2, X } from "lucide-react";
import {
  adminApi,
  errorMessage,
  type AdminRow,
  type TranslationLang,
  type TranslationMap,
} from "../../lib/adminApi";
import type { FieldDef } from "./types";

const LANGUAGES: Array<{ code: TranslationLang; label: string; short: string }> = [
  { code: "uz", label: "Uzbek", short: "UZ" },
  { code: "ru", label: "Russian", short: "RU" },
];

const inputClass =
  "w-full border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-slate/60 focus:border-signal focus:outline-none";

type Values = Record<TranslationLang, Record<string, string>>;

function emptyValues(fields: FieldDef[]): Values {
  const values: Values = { uz: {}, ru: {} };
  for (const field of fields) {
    values.uz[field.name] = "";
    values.ru[field.name] = "";
  }
  return values;
}

interface TranslationEditorProps {
  resource: string;
  objectId: number;
  fields: FieldDef[];
  base: AdminRow;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export default function TranslationEditor({
  resource,
  objectId,
  fields,
  base,
  onClose,
  onSaved,
}: TranslationEditorProps) {
  const [activeLang, setActiveLang] = useState<TranslationLang>("uz");
  const [values, setValues] = useState<Values>(() => emptyValues(fields));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    adminApi
      .getTranslations(resource, objectId)
      .then((data) => {
        if (!active) return;
        const next = emptyValues(fields);
        for (const field of fields) {
          for (const language of LANGUAGES) {
            next[language.code][field.name] =
              data.translations[field.name]?.[language.code] ?? "";
          }
        }
        setValues(next);
      })
      .catch((loadError) => {
        if (active) setError(errorMessage(loadError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [resource, objectId, fields]);

  function setValue(fieldName: string, value: string) {
    setValues((previous) => ({
      ...previous,
      [activeLang]: { ...previous[activeLang], [fieldName]: value },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const translations: TranslationMap = {};
    for (const field of fields) {
      translations[field.name] = {
        uz: values.uz[field.name] ?? "",
        ru: values.ru[field.name] ?? "",
      };
    }

    try {
      await adminApi.saveTranslations(resource, objectId, translations);
      setNotice("Translations saved.");
      onSaved("Translations saved.");
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
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
          <div className="flex items-start gap-3">
            <Languages size={20} className="mt-0.5 text-signal" />
            <div>
              <h2 className="font-display text-xl">Translations</h2>
              <p className="mt-1 text-xs text-slate">
                English values are the base. Empty translations fall back to
                English.
              </p>
            </div>
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

        <div className="mb-4 inline-flex border border-line">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => setActiveLang(language.code)}
              className={`px-4 py-2 text-xs font-medium uppercase tracking-wide transition-colors ${
                activeLang === language.code
                  ? "bg-ink text-paper"
                  : "text-slate hover:text-ink"
              }`}
            >
              {language.short} · {language.label}
            </button>
          ))}
        </div>

        {notice && (
          <div className="mb-4 flex items-center gap-2 border border-signal/30 bg-signal/5 px-3 py-2 text-sm text-signal">
            <CheckCircle2 size={15} /> {notice}
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-start gap-2 border border-danger-line bg-danger-surface px-3 py-2 text-sm text-danger">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-slate">
            <Loader2 size={20} className="mx-auto animate-spin" />
          </div>
        ) : (
          <form onSubmit={(event) => void handleSubmit(event)}>
            <div className="grid gap-4">
              {fields.map((field) => {
                const baseValue =
                  typeof base[field.name] === "string"
                    ? (base[field.name] as string)
                    : "";
                const id = `translation-${field.name}-${activeLang}`;
                const control =
                  field.type === "textarea" ? (
                    <textarea
                      id={id}
                      className={inputClass}
                      rows={field.rows ?? 4}
                      placeholder={baseValue}
                      value={values[activeLang][field.name] ?? ""}
                      onChange={(event) =>
                        setValue(field.name, event.target.value)
                      }
                    />
                  ) : (
                    <input
                      id={id}
                      type="text"
                      className={inputClass}
                      placeholder={baseValue}
                      value={values[activeLang][field.name] ?? ""}
                      onChange={(event) =>
                        setValue(field.name, event.target.value)
                      }
                    />
                  );

                return (
                  <div key={field.name}>
                    <label
                      htmlFor={id}
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate"
                    >
                      {field.label}
                    </label>
                    {control}
                    {baseValue && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate/70">
                        English: {baseValue}
                      </p>
                    )}
                  </div>
                );
              })}
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
                disabled={saving}
                className="inline-flex items-center gap-2 bg-ink px-5 py-2 text-sm text-paper hover:bg-signal disabled:opacity-60"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save translations
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

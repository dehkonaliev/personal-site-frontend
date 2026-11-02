import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Languages, Loader2, Save } from "lucide-react";
import {
  adminApi,
  errorMessage,
  type AdminRow,
} from "../../lib/adminApi";
import { FieldInput } from "./FormFields";
import TranslationEditor from "./TranslationEditor";
import { buildPayload, valuesFromRow } from "./formUtils";
import type { FieldDef } from "./types";

const HOME_FIELDS: FieldDef[] = [
  {
    name: "first_name",
    label: "First name",
    type: "text",
    maxLength: 30,
  },
  {
    name: "last_name",
    label: "Last name",
    type: "text",
    maxLength: 30,
  },
  {
    name: "job_title",
    label: "Headline label",
    type: "text",
    wide: true,
  },
  {
    name: "heading_activity",
    label: "Hero heading",
    type: "textarea",
    rows: 3,
    wide: true,
  },
  {
    name: "home_context",
    label: "Hero paragraph",
    type: "textarea",
    rows: 3,
    wide: true,
  },
  {
    name: "off_board",
    label: "Off the board",
    type: "textarea",
    rows: 4,
    wide: true,
  },
  {
    name: "photo",
    label: "Portrait",
    type: "file",
    accept: "image/*",
    folder: "home",
    wide: true,
  },
];

const RESUME_FIELDS: FieldDef[] = [
  {
    name: "location",
    label: "Location",
    type: "text",
    required: true,
    maxLength: 300,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
  },
  {
    name: "summary",
    label: "Summary",
    type: "textarea",
    rows: 4,
    required: true,
    wide: true,
  },
  {
    name: "website_url",
    label: "Website",
    type: "url",
  },
  {
    name: "github_url",
    label: "GitHub",
    type: "url",
  },
  {
    name: "linkedin_url",
    label: "LinkedIn",
    type: "url",
  },
  {
    name: "telegram_url",
    label: "Telegram",
    type: "url",
  },
  {
    name: "resume_file",
    label: "Resume PDF",
    type: "file",
    accept: ".pdf",
    folder: "resume",
  },
  {
    name: "image",
    label: "Portrait",
    type: "file",
    accept: "image/*",
    folder: "resume",
  },
];

const HOME_TRANSLATION_FIELDS = [
  "first_name",
  "last_name",
  "job_title",
  "heading_activity",
  "home_context",
  "off_board",
];

const RESUME_TRANSLATION_FIELDS = ["location", "summary"];

interface SingletonEditorProps {
  kind: "home" | "resume";
}

export default function SingletonEditor({ kind }: SingletonEditorProps) {
  const isHome = kind === "home";
  const fields = isHome ? HOME_FIELDS : RESUME_FIELDS;
  const title = isHome ? "Home page" : "Resume";
  const description = isHome
    ? "Hero copy, the off-the-board note, and the portrait."
    : "Contact details, summary, links, and downloadable files.";
  const translationFields = isHome
    ? HOME_TRANSLATION_FIELDS
    : RESUME_TRANSLATION_FIELDS;

  const [form, setForm] = useState<AdminRow>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [translationOpen, setTranslationOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loader = isHome ? adminApi.getHome() : adminApi.getResume();

    loader
      .then((data) => {
        if (!active) return;
        const { values, previews: loadedPreviews } = valuesFromRow(fields, data);
        setForm(values);
        setPreviews(loadedPreviews);
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
  }, [fields, isHome]);

  function setField(name: string, value: unknown) {
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleFileUploaded(name: string, path: string, url: string) {
    setForm((previous) => ({ ...previous, [name]: path }));
    setPreviews((previous) => ({ ...previous, [name]: url }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const payload = buildPayload(fields, form);
    try {
      if (isHome) await adminApi.updateHome(payload);
      else await adminApi.updateResume(payload);
      setNotice(`${title} saved.`);
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl">{title}</h1>
          <p className="mt-1 max-w-xl text-sm text-slate">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTranslationOpen(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-line px-4 py-2 text-sm text-slate hover:border-signal hover:text-signal disabled:opacity-60"
          >
            <Languages size={15} /> Translations (UZ/RU)
          </button>
          <button
            type="submit"
            form="singleton-form"
            disabled={saving || loading}
            className="inline-flex items-center gap-2 bg-ink px-5 py-2 text-sm text-paper hover:bg-signal disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save changes
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

      {loading ? (
        <div className="py-16 text-center text-slate">
          <Loader2 size={20} className="mx-auto animate-spin" />
        </div>
      ) : (
        <form
          id="singleton-form"
          onSubmit={(event) => void handleSubmit(event)}
          className="mt-6 max-w-3xl"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <FieldInput
                key={field.name}
                field={field}
                value={form[field.name]}
                options={[]}
                preview={previews[field.name]}
                onChange={(value) => setField(field.name, value)}
                onFileUploaded={handleFileUploaded}
              />
            ))}
          </div>
          <p className="mt-6 text-xs text-slate">
            Changes go live immediately after saving.
          </p>
        </form>
      )}

      {translationOpen && (
        <TranslationEditor
          resource={kind}
          objectId={0}
          fields={fields.filter((field) =>
            translationFields.includes(field.name),
          )}
          base={form}
          onClose={() => setTranslationOpen(false)}
          onSaved={(message) => {
            setTranslationOpen(false);
            setNotice(message);
          }}
        />
      )}
    </section>
  );
}

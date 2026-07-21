"use client";

import { useMemo, useState, type FormEvent } from "react";
import { saveAdminContentDraftAction } from "@/app/admin/actions";

type ValidationErrors = {
  title?: string;
  slug?: string;
  note?: string;
};

export function AdminValidationPanel() {
  const [title, setTitle] = useState("Konten publik desa");
  const [slug, setSlug] = useState("konten-publik-desa");
  const [note, setNote] = useState("Siapkan ringkasan konten sebelum publikasi.");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const errors = useMemo(() => validateForm({ title, slug, note }), [title, slug, note]);
  const hasErrors = Object.keys(errors).length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (hasErrors) {
      setMessage({ type: "error", text: "Form belum valid. Periksa field yang ditandai." });
      return;
    }

    setIsSaving(true);
    const result = await saveAdminContentDraftAction({ title, slug, note });
    setIsSaving(false);
    setMessage({
      type: result.ok ? "success" : "error",
      text: result.message,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      noValidate
    >
      <h2 className="text-lg font-semibold">Draft cepat konten</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        Simpan draft cepat ke Konten Umum dengan validasi lokal dan server action.
      </p>

      <div className="mt-5 grid gap-4">
        <FormField
          label="Judul konten"
          value={title}
          error={submitted ? errors.title : undefined}
          onChange={setTitle}
        />
        <FormField
          label="Slug"
          value={slug}
          error={submitted ? errors.slug : undefined}
          onChange={setSlug}
        />
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Catatan admin
          </label>
          <textarea
            className={`mt-2 min-h-24 w-full resize-none rounded-md border bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sage-700 ${
              submitted && errors.note ? "border-red-300" : "border-slate-300"
            }`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          {submitted && errors.note ? (
            <p className="mt-1 text-xs font-semibold text-red-600">{errors.note}</p>
          ) : null}
        </div>

        {message ? (
          <div
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-11 items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800 disabled:cursor-wait disabled:bg-sage-300"
        >
          {isSaving ? "Menyimpan" : "Simpan draft"}
        </button>
      </div>
    </form>
  );
}

function validateForm({
  title,
  slug,
  note,
}: {
  title: string;
  slug: string;
  note: string;
}) {
  const errors: ValidationErrors = {};

  if (title.trim().length < 5) {
    errors.title = "Judul minimal 5 karakter.";
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
    errors.slug = "Slug hanya boleh huruf kecil, angka, dan tanda hubung.";
  }

  if (note.trim().length < 20) {
    errors.note = "Catatan minimal 20 karakter.";
  }

  return errors;
}

function FormField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </label>
      <input
        className={`mt-2 h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-700 outline-none focus:border-sage-700 ${
          error ? "border-red-300" : "border-slate-300"
        }`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>
      ) : null}
    </div>
  );
}



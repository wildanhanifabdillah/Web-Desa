"use client";

import Image from "next/image";
import Link from "next/link";
import { AdminNavigation } from "@/components/admin-navigation";
import { useState, type FormEvent } from "react";
import type { HomepageHeroBanner } from "@/lib/homepage-hero-banner";
import type { HomepageProfileSummary } from "@/lib/homepage-profile-summary";

type AdminHomepagePageProps = {
  initialHero: HomepageHeroBanner;
  initialProfileSummary: HomepageProfileSummary;
};

type Notice = { type: "success" | "error"; message: string } | null;

export function AdminHomepagePage({ initialHero, initialProfileSummary }: AdminHomepagePageProps) {
  const [hero, setHero] = useState(initialHero);
  const [summary, setSummary] = useState(initialProfileSummary);
  const [notice, setNotice] = useState<Notice>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [savingSection, setSavingSection] = useState<"hero" | "profileSummary" | null>(null);

  async function saveHero(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSection("hero");
    setNotice(null);

    try {
      const updated = await saveHeroSection(hero, heroFile);
      setHero(updated);
      setHeroFile(null);
      setNotice({ type: "success", message: "Hero homepage berhasil disimpan." });
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) });
    } finally {
      setSavingSection(null);
    }
  }

  async function saveProfileSummary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSection("profileSummary");
    setNotice(null);

    try {
      const updated = await saveSection<HomepageProfileSummary>("profileSummary", summary);
      setSummary(updated);
      setNotice({ type: "success", message: "Ringkasan profil homepage berhasil disimpan." });
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) });
    } finally {
      setSavingSection(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-700">Admin Homepage</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">Kelola konten halaman utama</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Ubah hero dan ringkasan profil yang tampil di beranda publik. Perubahan disimpan ke storage lokal dan dibaca ulang oleh API homepage.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin" className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800">Dashboard</Link>
            <Link href="/" className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800">Preview publik</Link>
          </div>
        </div>
      </section>

            <AdminNavigation activeHref="/admin/homepage" />

      {notice ? (
        <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <div className={`mx-auto max-w-7xl rounded-md px-4 py-3 text-sm font-semibold ${notice.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {notice.message}
          </div>
        </div>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 xl:grid-cols-2 lg:px-8">
        <form onSubmit={saveHero} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage-700">Hero</p>
            <h2 className="mt-2 text-xl font-semibold">Banner utama</h2>
          </div>
          <div className="mt-5 grid gap-4">
            <TextInput label="Eyebrow" value={hero.eyebrow} onChange={(value) => setHero((current) => ({ ...current, eyebrow: value }))} />
            <TextArea label="Judul" value={hero.title} rows={3} onChange={(value) => setHero((current) => ({ ...current, title: value }))} />
            <TextArea label="Subtitle" value={hero.subtitle} rows={5} onChange={(value) => setHero((current) => ({ ...current, subtitle: value }))} />
            <ImageUploadInput label="Upload gambar hero" currentValue={hero.imageUrl} file={heroFile} onFileChange={setHeroFile} />
            <TextInput label="Deskripsi gambar" value={hero.imageAlt} onChange={(value) => setHero((current) => ({ ...current, imageAlt: value }))} />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput label="CTA utama" value={hero.primaryCta.label} onChange={(value) => setHero((current) => ({ ...current, primaryCta: { ...current.primaryCta, label: value } }))} />
              <TextInput label="Link CTA utama" value={hero.primaryCta.href} onChange={(value) => setHero((current) => ({ ...current, primaryCta: { ...current.primaryCta, href: value } }))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput label="CTA kedua" value={hero.secondaryCta?.label ?? ""} onChange={(value) => setHero((current) => ({ ...current, secondaryCta: { label: value, href: current.secondaryCta?.href ?? "/" } }))} />
              <TextInput label="Link CTA kedua" value={hero.secondaryCta?.href ?? ""} onChange={(value) => setHero((current) => ({ ...current, secondaryCta: { label: current.secondaryCta?.label ?? "Lihat", href: value } }))} />
            </div>
          </div>
          <button type="submit" disabled={savingSection === "hero"} className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800 disabled:cursor-wait disabled:opacity-70">
            {savingSection === "hero" ? "Menyimpan..." : "Simpan hero"}
          </button>
        </form>

        <form onSubmit={saveProfileSummary} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage-700">Ringkasan Profil</p>
            <h2 className="mt-2 text-xl font-semibold">Blok profil beranda</h2>
          </div>
          <div className="mt-5 grid gap-4">
            <TextArea label="Judul" value={summary.heading} rows={3} onChange={(value) => setSummary((current) => ({ ...current, heading: value }))} />
            <TextArea label="Paragraf" value={summary.body} rows={6} onChange={(value) => setSummary((current) => ({ ...current, body: value }))} />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput label="Desa" value={summary.location.village} onChange={(value) => setSummary((current) => ({ ...current, location: { ...current.location, village: value } }))} />
              <TextInput label="Kecamatan" value={summary.location.district} onChange={(value) => setSummary((current) => ({ ...current, location: { ...current.location, district: value } }))} />
              <TextInput label="Kabupaten" value={summary.location.regency} onChange={(value) => setSummary((current) => ({ ...current, location: { ...current.location, regency: value } }))} />
              <TextInput label="Provinsi" value={summary.location.province} onChange={(value) => setSummary((current) => ({ ...current, location: { ...current.location, province: value } }))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput label="Label highlight" value={summary.highlight.label} onChange={(value) => setSummary((current) => ({ ...current, highlight: { ...current.highlight, label: value } }))} />
              <TextInput label="Nilai highlight" value={summary.highlight.value} onChange={(value) => setSummary((current) => ({ ...current, highlight: { ...current.highlight, value } }))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput label="Label tombol" value={summary.cta.label} onChange={(value) => setSummary((current) => ({ ...current, cta: { ...current.cta, label: value } }))} />
              <TextInput label="Link tombol" value={summary.cta.href} onChange={(value) => setSummary((current) => ({ ...current, cta: { ...current.cta, href: value } }))} />
            </div>
          </div>
          <button type="submit" disabled={savingSection === "profileSummary"} className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800 disabled:cursor-wait disabled:opacity-70">
            {savingSection === "profileSummary" ? "Menyimpan..." : "Simpan ringkasan profil"}
          </button>
        </form>
      </section>
    </main>
  );
}

async function saveHeroSection(data: HomepageHeroBanner, file: File | null) {
  const formData = new FormData();

  formData.append("section", "hero");
  formData.append("data", JSON.stringify(data));

  if (file) {
    formData.append("file", file);
  }

  const response = await fetch("/api/admin/homepage", {
    method: "PUT",
    body: formData,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Data homepage gagal disimpan.");
  }

  return payload.data as HomepageHeroBanner;
}

async function saveSection<T>(section: "hero" | "profileSummary", data: T) {
  const response = await fetch("/api/admin/homepage", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ section, data }),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Data homepage gagal disimpan.");
  }

  return payload.data as T;
}

function ImageUploadInput({
  label,
  currentValue,
  file,
  onFileChange,
}: {
  label: string;
  currentValue: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {currentValue ? (
        <div className="aspect-[16/9] w-full overflow-hidden rounded-md border border-slate-200 bg-slate-100">
          <Image src={currentValue} alt="Preview gambar hero" width={960} height={540} className="h-full w-full object-cover" unoptimized />
        </div>
      ) : null}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-sage-700 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
      />
      <span className="text-xs font-medium text-slate-500">
        {file ? file.name : "Gambar sudah tersimpan."}
      </span>
    </label>
  );
}
function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-950 outline-none transition-colors focus:border-sage-700" />
    </label>
  );
}

function TextArea({ label, value, rows, onChange }: { label: string; value: string; rows: number; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} className="resize-y rounded-md border border-slate-300 px-3 py-2 text-sm font-medium leading-6 text-slate-950 outline-none transition-colors focus:border-sage-700" />
    </label>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Data homepage gagal disimpan.";
}









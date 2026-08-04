"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AdminNavigation } from "@/components/admin-navigation";
import type { ProfileGeographyFact, ProfileGeographyRecord } from "@/lib/profile-geography";
import type { ProfileMissionInput, ProfileVisionMissionRecord } from "@/lib/profile-vision-mission";

type AdminProfilePageProps = {
  initialGeography?: ProfileGeographyRecord | null;
  initialVisionMission?: ProfileVisionMissionRecord | null;
};

type Notice = { type: "success" | "error"; message: string } | null;
type SavingSection = "geography" | "visionMission" | null;

const emptyGeography: ProfileGeographyRecord = {
  id: "",
  kicker: "Kondisi Geografis",
  title: "",
  description: "",
  stats: [],
  borders: [],
  updatedAt: new Date().toISOString(),
};

const emptyVisionMission: ProfileVisionMissionRecord = {
  id: "",
  visionLabel: "Visi Desa",
  visionTitle: "",
  visionDescription: "",
  missions: [],
  updatedAt: new Date().toISOString(),
};

export function AdminProfilePage({ initialGeography, initialVisionMission }: AdminProfilePageProps) {
  const [geography, setGeography] = useState(initialGeography ?? emptyGeography);
  const [visionMission, setVisionMission] = useState(initialVisionMission ?? emptyVisionMission);
  const [notice, setNotice] = useState<Notice>(null);
  const [savingSection, setSavingSection] = useState<SavingSection>(null);

  async function saveGeography(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSection("geography");
    setNotice(null);

    try {
      const updated = await saveSection<ProfileGeographyRecord>("geography", geography.id, {
        kicker: geography.kicker,
        title: geography.title,
        description: geography.description,
        stats: geography.stats,
        borders: geography.borders,
      });
      setGeography(updated);
      setNotice({ type: "success", message: "Kondisi geografis berhasil disimpan." });
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) });
    } finally {
      setSavingSection(null);
    }
  }

  async function saveVisionMission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSection("visionMission");
    setNotice(null);

    try {
      const updated = await saveSection<ProfileVisionMissionRecord>("visionMission", visionMission.id, {
        visionLabel: visionMission.visionLabel,
        visionTitle: visionMission.visionTitle,
        visionDescription: visionMission.visionDescription,
        missions: visionMission.missions,
      });
      setVisionMission(updated);
      setNotice({ type: "success", message: "Visi dan misi berhasil disimpan." });
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
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-700">Admin Profil Desa</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">Kelola konten profil publik</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Ubah kondisi geografis serta visi dan misi yang tampil di halaman profil desa.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin" className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800">Dasbor</Link>
            <Link href="/profil" className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800">Lihat halaman</Link>
          </div>
        </div>
      </section>

      <AdminNavigation activeHref="/admin/profil" />

      {notice ? (
        <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <div className={`mx-auto max-w-7xl rounded-md px-4 py-3 text-sm font-semibold ${notice.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {notice.message}
          </div>
        </div>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 xl:grid-cols-2 lg:px-8">
        <form onSubmit={saveGeography} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeading eyebrow="Geografis" title="Kondisi wilayah" />
          <div className="mt-5 grid gap-4">
            <TextInput label="Kicker" value={geography.kicker} onChange={(value) => setGeography((current) => ({ ...current, kicker: value }))} />
            <TextArea label="Judul" value={geography.title} rows={3} onChange={(value) => setGeography((current) => ({ ...current, title: value }))} />
            <TextArea label="Deskripsi" value={geography.description} rows={5} onChange={(value) => setGeography((current) => ({ ...current, description: value }))} />
            <FactListEditor title="Statistik wilayah" items={geography.stats} onChange={(items) => setGeography((current) => ({ ...current, stats: items }))} />
            <FactListEditor title="Batas wilayah" items={geography.borders} onChange={(items) => setGeography((current) => ({ ...current, borders: items }))} />
          </div>
          <SubmitButton loading={savingSection === "geography"} label="Simpan geografis" />
        </form>

        <form onSubmit={saveVisionMission} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeading eyebrow="Visi Misi" title="Arah pembangunan desa" />
          <div className="mt-5 grid gap-4">
            <TextInput label="Label visi" value={visionMission.visionLabel} onChange={(value) => setVisionMission((current) => ({ ...current, visionLabel: value }))} />
            <TextArea label="Judul visi" value={visionMission.visionTitle} rows={3} onChange={(value) => setVisionMission((current) => ({ ...current, visionTitle: value }))} />
            <TextArea label="Deskripsi visi" value={visionMission.visionDescription} rows={5} onChange={(value) => setVisionMission((current) => ({ ...current, visionDescription: value }))} />
            <MissionListEditor items={visionMission.missions} onChange={(items) => setVisionMission((current) => ({ ...current, missions: items }))} />
          </div>
          <SubmitButton loading={savingSection === "visionMission"} label="Simpan visi misi" />
        </form>
      </section>
    </main>
  );
}

async function saveSection<T>(section: "geography" | "visionMission", id: string, data: unknown) {
  const response = await fetch("/api/admin/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ section, id, data }),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Data profil gagal disimpan.");
  }

  return payload.data as T;
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage-700">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold">{title}</h2>
    </div>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <input required value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-950 outline-none transition-colors focus:border-sage-700" />
    </label>
  );
}

function TextArea({ label, value, rows, onChange }: { label: string; value: string; rows: number; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <textarea required value={value} rows={rows} onChange={(event) => onChange(event.target.value)} className="resize-y rounded-md border border-slate-300 px-3 py-2 text-sm font-medium leading-6 text-slate-950 outline-none transition-colors focus:border-sage-700" />
    </label>
  );
}

function FactListEditor({ title, items, onChange }: { title: string; items: ProfileGeographyFact[]; onChange: (items: ProfileGeographyFact[]) => void }) {
  return (
    <div className="grid gap-3 rounded-md border border-slate-200 bg-stone-50 p-4">
      <ListHeader title={title} onAdd={() => onChange([...items, { label: "", value: "" }])} />
      {items.map((item, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input required aria-label={`${title} label ${index + 1}`} value={item.label} onChange={(event) => onChange(updateAt(items, index, { ...item, label: event.target.value }))} className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
          <input required aria-label={`${title} nilai ${index + 1}`} value={item.value} onChange={(event) => onChange(updateAt(items, index, { ...item, value: event.target.value }))} className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
          <RemoveButton onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} />
        </div>
      ))}
    </div>
  );
}

function MissionListEditor({ items, onChange }: { items: ProfileMissionInput[]; onChange: (items: ProfileMissionInput[]) => void }) {
  return (
    <div className="grid gap-3 rounded-md border border-slate-200 bg-stone-50 p-4">
      <ListHeader title="Daftar misi" onAdd={() => onChange([...items, { focus: "", description: "" }])} />
      {items.map((item, index) => (
        <div key={index} className="grid gap-2 rounded-md border border-slate-200 bg-white p-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input required aria-label={`Fokus misi ${index + 1}`} value={item.focus} onChange={(event) => onChange(updateAt(items, index, { ...item, focus: event.target.value }))} className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
            <RemoveButton onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} />
          </div>
          <textarea required aria-label={`Deskripsi misi ${index + 1}`} value={item.description} rows={3} onChange={(event) => onChange(updateAt(items, index, { ...item, description: event.target.value }))} className="resize-y rounded-md border border-slate-300 px-3 py-2 text-sm leading-6" />
        </div>
      ))}
    </div>
  );
}

function ListHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <button type="button" onClick={onAdd} className="rounded-md border border-sage-200 bg-sage-50 px-3 py-2 text-xs font-semibold text-sage-800 hover:bg-sage-100">
        Tambah
      </button>
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="h-10 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100">
      Hapus
    </button>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800 disabled:cursor-wait disabled:opacity-70">
      {loading ? "Menyimpan..." : label}
    </button>
  );
}

function updateAt<T>(items: T[], index: number, nextItem: T) {
  return items.map((item, itemIndex) => (itemIndex === index ? nextItem : item));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Data profil gagal disimpan.";
}

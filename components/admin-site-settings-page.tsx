"use client";

import Link from "next/link";
import { AdminNavigation } from "@/components/admin-navigation";
import { useState, type FormEvent } from "react";
import type { SiteSettings } from "@/lib/site-settings";

type AdminSiteSettingsPageProps = {
  initialSettings: SiteSettings;
};

type Notice = { type: "success" | "error"; message: string } | null;

export function AdminSiteSettingsPage({ initialSettings }: AdminSiteSettingsPageProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [navigationJson, setNavigationJson] = useState(JSON.stringify(initialSettings.header.navigation, null, 2));
  const [quickLinksJson, setQuickLinksJson] = useState(JSON.stringify(initialSettings.footer.quickLinks, null, 2));
  const [publicLinksJson, setPublicLinksJson] = useState(JSON.stringify(initialSettings.footer.publicLinks, null, 2));
  const [contactsJson, setContactsJson] = useState(JSON.stringify(initialSettings.footer.contacts, null, 2));
  const [socialLinksJson, setSocialLinksJson] = useState(JSON.stringify(initialSettings.socialLinks, null, 2));
  const [notice, setNotice] = useState<Notice>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setNotice(null);

    try {
      const payload: Omit<SiteSettings, "id" | "updatedAt"> = {
        brand: settings.brand,
        header: {
          ...settings.header,
          navigation: parseJsonArray(navigationJson, "Navigasi header"),
        },
        footer: {
          ...settings.footer,
          quickLinks: parseJsonArray(quickLinksJson, "Link navigasi footer"),
          publicLinks: parseJsonArray(publicLinksJson, "Link publik footer"),
          contacts: parseJsonArray(contactsJson, "Kontak footer"),
        },
        socialLinks: parseJsonArray(socialLinksJson, "Link sosial media"),
      };
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error ?? "Pengaturan website gagal disimpan.");
      }

      setSettings(result.data as SiteSettings);
      setNotice({ type: "success", message: "Pengaturan website berhasil disimpan." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Pengaturan website gagal disimpan." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-700">Admin Pengaturan</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">Kelola header, footer, dan kontak</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Pengaturan ini dipakai oleh header dan footer publik melalui API, sehingga perubahan langsung berlaku di semua halaman.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin" className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800">Dashboard</Link>
            <Link href="/" className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800">Preview publik</Link>
          </div>
        </div>
      </section>

            <AdminNavigation activeHref="/admin/pengaturan" />

      {notice ? (
        <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <div className={`mx-auto max-w-7xl rounded-md px-4 py-3 text-sm font-semibold ${notice.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{notice.message}</div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 xl:grid-cols-2 lg:px-8">
        <section className="grid gap-5">
          <Panel title="Brand Header/Footer">
            <TextInput label="Eyebrow brand" value={settings.brand.eyebrow} onChange={(value) => setSettings((current) => ({ ...current, brand: { ...current.brand, eyebrow: value } }))} />
            <TextInput label="Nama brand" value={settings.brand.name} onChange={(value) => setSettings((current) => ({ ...current, brand: { ...current.brand, name: value } }))} />
            <TextInput label="Logo URL" value={settings.brand.logoUrl} onChange={(value) => setSettings((current) => ({ ...current, brand: { ...current.brand, logoUrl: value } }))} />
            <TextInput label="Alt logo" value={settings.brand.logoAlt} onChange={(value) => setSettings((current) => ({ ...current, brand: { ...current.brand, logoAlt: value } }))} />
            <TextInput label="Aria label brand" value={settings.brand.ariaLabel} onChange={(value) => setSettings((current) => ({ ...current, brand: { ...current.brand, ariaLabel: value } }))} />
          </Panel>

          <Panel title="Header">
            <TextInput label="Label tombol admin" value={settings.header.adminLabel} onChange={(value) => setSettings((current) => ({ ...current, header: { ...current.header, adminLabel: value } }))} />
            <TextInput label="Link tombol admin" value={settings.header.adminHref} onChange={(value) => setSettings((current) => ({ ...current, header: { ...current.header, adminHref: value } }))} />
            <TextArea label="Navigasi header JSON" value={navigationJson} rows={10} onChange={setNavigationJson} />
          </Panel>
        </section>

        <section className="grid gap-5">
          <Panel title="Footer Utama">
            <TextInput label="Eyebrow footer" value={settings.footer.eyebrow} onChange={(value) => setSettings((current) => ({ ...current, footer: { ...current.footer, eyebrow: value } }))} />
            <TextArea label="Tagline" value={settings.footer.tagline} rows={2} onChange={(value) => setSettings((current) => ({ ...current, footer: { ...current.footer, tagline: value } }))} />
            <TextArea label="Deskripsi" value={settings.footer.description} rows={4} onChange={(value) => setSettings((current) => ({ ...current, footer: { ...current.footer, description: value } }))} />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput label="Label CTA" value={settings.footer.cta.label} onChange={(value) => setSettings((current) => ({ ...current, footer: { ...current.footer, cta: { ...current.footer.cta, label: value } } }))} />
              <TextInput label="Link CTA" value={settings.footer.cta.href} onChange={(value) => setSettings((current) => ({ ...current, footer: { ...current.footer, cta: { ...current.footer.cta, href: value } } }))} />
            </div>
            <TextInput label="Judul jam layanan" value={settings.footer.serviceHoursTitle} onChange={(value) => setSettings((current) => ({ ...current, footer: { ...current.footer, serviceHoursTitle: value } }))} />
            <TextInput label="Jam layanan" value={settings.footer.serviceHours} onChange={(value) => setSettings((current) => ({ ...current, footer: { ...current.footer, serviceHours: value } }))} />
            <TextArea label="Copyright" value={settings.footer.copyright} rows={2} onChange={(value) => setSettings((current) => ({ ...current, footer: { ...current.footer, copyright: value } }))} />
            <TextArea label="Credit" value={settings.footer.credit} rows={2} onChange={(value) => setSettings((current) => ({ ...current, footer: { ...current.footer, credit: value } }))} />
          </Panel>

          <Panel title="Footer Link dan Kontak">
            <TextArea label="Quick links JSON" value={quickLinksJson} rows={8} onChange={setQuickLinksJson} />
            <TextArea label="Public links JSON" value={publicLinksJson} rows={5} onChange={setPublicLinksJson} />
            <TextArea label="Kontak JSON" value={contactsJson} rows={8} onChange={setContactsJson} />
            <TextArea label="Sosial media JSON" value={socialLinksJson} rows={8} onChange={setSocialLinksJson} />
          </Panel>

          <button type="submit" disabled={isSaving} className="inline-flex h-12 items-center justify-center rounded-md bg-sage-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-sage-800 disabled:cursor-wait disabled:bg-slate-400">
            {isSaving ? "Menyimpan..." : "Simpan pengaturan"}
          </button>
        </section>
      </form>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
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
      <textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} className="resize-y rounded-md border border-slate-300 px-3 py-2 font-mono text-xs leading-5 text-slate-950 outline-none transition-colors focus:border-sage-700" />
    </label>
  );
}

function parseJsonArray<T>(value: string, label: string): T[] {
  const parsed: unknown = JSON.parse(value);

  if (!Array.isArray(parsed)) {
    throw new Error(`${label} harus berupa array JSON.`);
  }

  return parsed as T[];
}




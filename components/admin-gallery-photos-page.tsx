"use client";

import Link from "next/link";
import { AdminNavigation } from "@/components/admin-navigation";
import { useState, type FormEvent } from "react";
import type { GalleryAlbum, GalleryPhoto } from "@/lib/gallery";

type AdminGalleryPhotosPageProps = {
  album: GalleryAlbum;
};

type Notice = { type: "success" | "error"; message: string } | null;

type FormState = {
  id: string;
  title: string;
  description: string;
  image: string;
  takenAt: string;
};

const emptyForm: FormState = {
  id: "",
  title: "",
  description: "",
  image: "",
  takenAt: new Date().toISOString().slice(0, 10),
};

export function AdminGalleryPhotosPage({ album }: AdminGalleryPhotosPageProps) {
  const [photos, setPhotos] = useState(album.photos);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [isSaving, setIsSaving] = useState(false);

  function startCreate() {
    setMode("create");
    setForm(emptyForm);
    setFile(null);
    setNotice(null);
  }

  function startEdit(photo: GalleryPhoto) {
    setMode("edit");
    setForm({
      id: photo.id,
      title: photo.title,
      description: photo.description,
      image: photo.image,
      takenAt: formatDateInputValue(photo.takenAt),
    });
    setFile(null);
    setNotice(null);
  }

  async function refreshPhotos() {
    const response = await fetch(`/api/admin/gallery/photos?album=${encodeURIComponent(album.slug)}`, { cache: "no-store" });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.error ?? "Gagal memuat foto album.");
    }

    setPhotos(payload.data ?? []);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setNotice(null);

    try {
      const formData = new FormData();
      formData.append("album", album.slug);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("image", form.image);
      formData.append("takenAt", form.takenAt);

      if (mode === "edit") {
        formData.append("id", form.id);
      }

      if (file) {
        formData.append("file", file);
      }

      const response = await fetch("/api/admin/gallery/photos", {
        method: mode === "create" ? "POST" : "PUT",
        body: formData,
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Foto gagal disimpan.");
      }

      await refreshPhotos();
      setNotice({ type: "success", message: mode === "create" ? "Foto berhasil ditambahkan." : "Foto berhasil diperbarui." });

      if (mode === "create") {
        startCreate();
      }
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Foto gagal disimpan." });
    } finally {
      setIsSaving(false);
    }
  }

  async function deletePhoto(photo: GalleryPhoto) {
    if (!window.confirm(`Hapus foto "${photo.title}"?`)) {
      return;
    }

    try {
      const params = new URLSearchParams({ album: album.slug, id: photo.id });
      const response = await fetch(`/api/admin/gallery/photos?${params.toString()}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Foto gagal dihapus.");
      }

      await refreshPhotos();
      setNotice({ type: "success", message: "Foto berhasil dihapus." });

      if (form.id === photo.id) {
        startCreate();
      }
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Foto gagal dihapus." });
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-700">Admin Galeri</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">Kelola foto album</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Album: <strong>{album.title}</strong>. Tambah, edit, hapus, dan unggah foto album tanpa mengubah JSON manual.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/galeri" className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800">Album</Link>
            <Link href={`/galeri/${album.slug}`} className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800">Preview publik</Link>
          </div>
        </div>
      </section>

            <AdminNavigation activeHref="/admin/galeri" />

      {notice ? (
        <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <div className={`mx-auto max-w-7xl rounded-md px-4 py-3 text-sm font-semibold ${notice.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{notice.message}</div>
        </div>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Daftar foto</h2>
              <p className="mt-1 text-sm text-slate-500">Total {photos.length} foto dalam album ini.</p>
            </div>
            <button type="button" onClick={() => refreshPhotos().catch((error: Error) => setNotice({ type: "error", message: error.message }))} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sage-700 hover:text-sage-800">Refresh</button>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {photos.map((photo) => (
              <article key={photo.id} className="overflow-hidden rounded-lg border border-slate-200 bg-stone-50">
                <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${photo.image})` }} aria-hidden="true" />
                <div className="p-4">
                  <h3 className="font-semibold leading-6 text-slate-950">{photo.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{photo.description}</p>
                  <time className="mt-3 block text-xs font-semibold text-slate-500">{formatDate(photo.takenAt)}</time>
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => startEdit(photo)} className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white">Edit</button>
                    <button type="button" onClick={() => deletePhoto(photo)} className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Hapus</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="self-start rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{mode === "create" ? "Tambah foto" : "Edit foto"}</h2>
          <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
            <TextInput label="Judul" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
            <TextArea label="Deskripsi" value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} />
            <TextInput label="Path gambar" value={form.image} onChange={(value) => setForm((current) => ({ ...current, image: value }))} />
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              <span>Upload gambar</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-sage-700 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white" />
              <span className="text-xs text-slate-500">{file ? file.name : "Opsional jika path gambar sudah diisi."}</span>
            </label>
            <TextInput label="Tanggal foto" type="date" value={form.takenAt} onChange={(value) => setForm((current) => ({ ...current, takenAt: value }))} />
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={startCreate} className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800">Reset</button>
              <button type="submit" disabled={isSaving} className="inline-flex h-11 items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800 disabled:cursor-wait disabled:bg-slate-400">{isSaving ? "Menyimpan..." : mode === "create" ? "Simpan" : "Perbarui"}</button>
            </div>
          </form>
        </aside>
      </section>
    </main>
  );
}

function TextInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <input required type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none focus:border-sage-700" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <textarea required value={value} onChange={(event) => onChange(event.target.value)} className="min-h-24 resize-y rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 text-slate-950 outline-none focus:border-sage-700" />
    </label>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}




function formatDateInputValue(value: string) {
  return value.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? value;
}

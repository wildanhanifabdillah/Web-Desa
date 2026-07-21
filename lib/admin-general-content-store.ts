import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";

export type AdminContentStatus = "draft" | "published" | "archived";

export type AdminGeneralContentBlock = {
  id: string;
  slug: string;
  title: string;
  area: string;
  status: AdminContentStatus;
  updatedAt: string;
  description: string;
  body: string;
};

const initialContentBlocks: AdminGeneralContentBlock[] = [
  {
    id: "site-identity",
    slug: "identitas-website",
    title: "Identitas website",
    area: "Header dan branding",
    status: "published",
    updatedAt: "2026-07-14T00:00:00.000Z",
    description: "Nama desa, logo inisial, dan label kanal digital desa.",
    body: "Desa Keseneng Digital menjadi identitas utama kanal informasi desa.",
  },
  {
    id: "homepage-content",
    slug: "konten-homepage",
    title: "Konten homepage",
    area: "Banner dan ringkasan",
    status: "draft",
    updatedAt: "2026-07-13T00:00:00.000Z",
    description: "Judul hero, ajakan utama, statistik ringkas, dan profil singkat.",
    body: "Konten homepage menggabungkan hero, ringkasan profil, statistik, berita, dan potensi unggulan.",
  },
  {
    id: "contact-info",
    slug: "informasi-kontak",
    title: "Informasi kontak",
    area: "Footer dan administrasi",
    status: "published",
    updatedAt: "2026-07-12T00:00:00.000Z",
    description: "Alamat kantor, email, nomor layanan, dan jam pelayanan.",
    body: "Informasi kontak membantu warga mengakses layanan administrasi desa.",
  },
  {
    id: "main-navigation",
    slug: "menu-navigasi",
    title: "Menu navigasi",
    area: "Navigasi utama",
    status: "published",
    updatedAt: "2026-07-10T00:00:00.000Z",
    description: "Urutan menu Beranda, Profil, Potensi, Berita, Statistik, dan Dokumen.",
    body: "Menu navigasi publik disusun untuk akses cepat ke kanal informasi desa.",
  },
];

let contentBlocks = loadJsonFile("admin-content-blocks.json", initialContentBlocks);

export type AdminGeneralContentInput = Partial<Omit<AdminGeneralContentBlock, "id" | "updatedAt">> & {
  id?: string;
};

export function createAdminGeneralContentBlock(input: AdminGeneralContentInput) {
  const validation = validateAdminGeneralContentInput(input);

  if (!validation.ok) {
    return validation;
  }

  if (contentBlocks.some((block) => block.slug === validation.input.slug)) {
    return { ok: false as const, status: 409, error: "Slug konten umum sudah dipakai." };
  }

  const block: AdminGeneralContentBlock = {
    id: input.id?.trim() || crypto.randomUUID(),
    ...validation.input,
    updatedAt: new Date().toISOString(),
  };

  contentBlocks = [block, ...contentBlocks];
  saveJsonFile("admin-content-blocks.json", contentBlocks);

  return { ok: true as const, data: block };
}

export function updateAdminGeneralContentBlock(idOrSlug: string, input: AdminGeneralContentInput) {
  const index = contentBlocks.findIndex((block) => block.id === idOrSlug || block.slug === idOrSlug);

  if (index < 0) {
    return { ok: false as const, status: 404, error: "Konten umum tidak ditemukan." };
  }

  const current = contentBlocks[index];
  const validation = validateAdminGeneralContentInput({ ...current, ...input });

  if (!validation.ok) {
    return validation;
  }

  const duplicateSlug = contentBlocks.some(
    (block) => block.slug === validation.input.slug && block.id !== current.id,
  );

  if (duplicateSlug) {
    return { ok: false as const, status: 409, error: "Slug konten umum sudah dipakai." };
  }

  const block: AdminGeneralContentBlock = {
    ...current,
    ...validation.input,
    updatedAt: new Date().toISOString(),
  };

  contentBlocks = contentBlocks.map((item) => item.id === current.id ? block : item);
  saveJsonFile("admin-content-blocks.json", contentBlocks);

  return { ok: true as const, data: block };
}

export function deleteAdminGeneralContentBlock(idOrSlug: string) {
  const block = getAdminGeneralContentBlock(idOrSlug);

  if (!block) {
    return null;
  }

  contentBlocks = contentBlocks.filter((item) => item.id !== block.id);
  saveJsonFile("admin-content-blocks.json", contentBlocks);

  return block;
}

export function resetAdminGeneralContentBlocks() {
  contentBlocks = resetJsonFile("admin-content-blocks.json", initialContentBlocks);

  return listAdminGeneralContentBlocks();
}
export function listAdminGeneralContentBlocks() {
  return [...contentBlocks];
}

export function getAdminGeneralContentBlock(idOrSlug: string) {
  return contentBlocks.find((block) => block.id === idOrSlug || block.slug === idOrSlug) ?? null;
}

export function searchAdminGeneralContentBlocks({
  query,
  status,
}: {
  query?: string;
  status?: AdminContentStatus;
}) {
  const normalizedQuery = query?.trim().toLowerCase();

  return contentBlocks.filter((block) => {
    const matchesQuery = normalizedQuery
      ? [block.title, block.slug, block.area, block.description, block.body]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      : true;
    const matchesStatus = status ? block.status === status : true;

    return matchesQuery && matchesStatus;
  });
}

export function isAdminContentStatus(value: string | null | undefined): value is AdminContentStatus {
  return value === "draft" || value === "published" || value === "archived";
}
function validateAdminGeneralContentInput(input: AdminGeneralContentInput) {
  const slug = input.slug?.trim();
  const title = input.title?.trim();
  const area = input.area?.trim();
  const description = input.description?.trim();
  const body = input.body?.trim();
  const status = input.status ?? "draft";

  if (!slug || !title || !area || !description || !body) {
    return {
      ok: false as const,
      status: 400,
      error: "Slug, judul, area, deskripsi, dan isi konten wajib diisi.",
    };
  }

  if (!isAdminContentStatus(status)) {
    return { ok: false as const, status: 400, error: "Status konten umum tidak valid." };
  }

  return {
    ok: true as const,
    input: {
      slug,
      title,
      area,
      description,
      body,
      status,
    },
  };
}

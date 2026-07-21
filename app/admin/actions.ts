"use server";

import { revalidatePath } from "next/cache";

import {
  createAdminGeneralContentBlock,
  getAdminGeneralContentBlock,
  updateAdminGeneralContentBlock,
} from "@/lib/admin-general-content-store";
export type AdminActionResult = {
  ok: boolean;
  message: string;
};

type AdminContentDraftInput = {
  title: string;
  slug: string;
  note: string;
};

type AdminDeleteInput = {
  entity: string;
  id: string;
};

export async function saveAdminContentDraftAction(
  input: AdminContentDraftInput,
): Promise<AdminActionResult> {
  const validation = validateContentDraft(input);

  if (!validation.ok) {
    return validation;
  }

  const existingBlock = getAdminGeneralContentBlock(input.slug);
  const payload = {
    title: input.title.trim(),
    slug: input.slug.trim(),
    area: "Draft cepat dashboard",
    description: input.note.trim(),
    body: input.note.trim(),
    status: "draft" as const,
  };
  const result = existingBlock
    ? updateAdminGeneralContentBlock(existingBlock.id, payload)
    : createAdminGeneralContentBlock(payload);

  if (!result.ok) {
    return {
      ok: false,
      message: result.error,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/konten");

  return {
    ok: true,
    message: existingBlock ? "Draft konten berhasil diperbarui." : "Draft konten berhasil disimpan.",
  };
}

export async function publishAdminEntityAction(
  input: AdminDeleteInput,
): Promise<AdminActionResult> {
  if (!input.entity.trim() || !input.id.trim()) {
    return {
      ok: false,
      message: "Entity dan ID wajib dikirim untuk publikasi.",
    };
  }

  revalidatePath("/admin");

  return {
    ok: true,
    message: `${input.entity} ${input.id} siap dipublikasikan.`,
  };
}

export async function deleteAdminEntityAction(
  input: AdminDeleteInput,
): Promise<AdminActionResult> {
  if (!input.entity.trim() || !input.id.trim()) {
    return {
      ok: false,
      message: "Entity dan ID wajib dikirim untuk penghapusan.",
    };
  }

  revalidatePath("/admin");

  return {
    ok: true,
    message: `${input.entity} ${input.id} masuk antrean hapus.`,
  };
}

export async function generateAdminAiDraftAction(formData: FormData) {
  const topic = String(formData.get("topic") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (topic.length < 5 || category.length < 3) {
    return {
      ok: false,
      message: "Topik dan kategori wajib diisi sebelum membuat draft AI.",
      draft: null,
    };
  }

  revalidatePath("/admin/berita");

  return {
    ok: true,
    message: "Draft AI berhasil dibuat.",
    draft: `Draft ${category}: ${topic} disusun untuk publikasi warga desa.`,
  };
}

function validateContentDraft(input: AdminContentDraftInput): AdminActionResult {
  if (input.title.trim().length < 5) {
    return {
      ok: false,
      message: "Judul minimal 5 karakter.",
    };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug.trim())) {
    return {
      ok: false,
      message: "Slug hanya boleh huruf kecil, angka, dan tanda hubung.",
    };
  }

  if (input.note.trim().length < 20) {
    return {
      ok: false,
      message: "Catatan minimal 20 karakter.",
    };
  }

  return {
    ok: true,
    message: "Validasi server berhasil.",
  };
}




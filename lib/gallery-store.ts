import {
  getGalleryAlbums,
  getGalleryVideos,
  type GalleryAlbum,
  type GalleryPhoto,
  type GalleryVideo,
} from "@/lib/gallery";
import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";

export type GalleryAlbumInput = Omit<GalleryAlbum, "id" | "photoCount" | "updatedAt"> & {
  id?: string;
  photoCount?: number;
  updatedAt?: string;
};

export type GalleryVideoInput = Omit<GalleryVideo, "id"> & {
  id?: string;
};

let galleryAlbums: GalleryAlbum[] | null = null;
let galleryVideos: GalleryVideo[] | null = null;

export async function listGalleryAlbumRecords() {
  if (!galleryAlbums) {
    galleryAlbums = loadJsonFile("gallery-albums.json", await getGalleryAlbums());
  }

  return galleryAlbums ?? [];
}

export async function getGalleryAlbumRecord(slug: string) {
  const albums = await listGalleryAlbumRecords();

  return albums.find((album) => album.slug === slug || album.id === slug) ?? null;
}

export async function createGalleryAlbumRecord(input: GalleryAlbumInput) {
  const albums = await listGalleryAlbumRecords();
  const slug = normalizeSlug(input.slug || input.title);

  if (albums.some((album) => album.slug === slug || album.id === input.id)) {
    return null;
  }

  const photos = normalizePhotos(input.photos);
  const album: GalleryAlbum = {
    ...input,
    id: input.id?.trim() || crypto.randomUUID(),
    slug,
    photoCount: photos.length,
    updatedAt: input.updatedAt || new Date().toISOString(),
    photos,
  };

  galleryAlbums = [album, ...albums];
  saveJsonFile("gallery-albums.json", galleryAlbums);

  return album;
}

export async function updateGalleryAlbumRecord(idOrSlug: string, input: Partial<GalleryAlbumInput>) {
  const albums = await listGalleryAlbumRecords();
  const existingAlbum = albums.find((album) => album.id === idOrSlug || album.slug === idOrSlug);

  if (!existingAlbum) {
    return null;
  }

  const photos = input.photos ? normalizePhotos(input.photos) : existingAlbum.photos;
  const updatedAlbum: GalleryAlbum = {
    ...existingAlbum,
    ...input,
    id: existingAlbum.id,
    slug: input.slug ? normalizeSlug(input.slug) : existingAlbum.slug,
    photoCount: photos.length,
    updatedAt: new Date().toISOString(),
    photos,
  };

  galleryAlbums = albums.map((album) => album.id === existingAlbum.id ? updatedAlbum : album);
  saveJsonFile("gallery-albums.json", galleryAlbums);

  return updatedAlbum;
}

export async function deleteGalleryAlbumRecord(idOrSlug: string) {
  const albums = await listGalleryAlbumRecords();
  const existingAlbum = albums.find((album) => album.id === idOrSlug || album.slug === idOrSlug);

  if (!existingAlbum) {
    return null;
  }

  galleryAlbums = albums.filter((album) => album.id !== existingAlbum.id);
  saveJsonFile("gallery-albums.json", galleryAlbums);

  return existingAlbum;
}

export async function resetGalleryAlbumRecords() {
  galleryAlbums = resetJsonFile("gallery-albums.json", await getGalleryAlbums());

  return galleryAlbums;
}

export async function listGalleryVideoRecords() {
  if (!galleryVideos) {
    galleryVideos = loadJsonFile("gallery-videos.json", await getGalleryVideos());
  }

  return galleryVideos ?? [];
}

export async function getGalleryVideoRecord(id: string) {
  const videos = await listGalleryVideoRecords();

  return videos.find((video) => video.id === id) ?? null;
}

export async function createGalleryVideoRecord(input: GalleryVideoInput) {
  const videos = await listGalleryVideoRecords();
  const id = input.id?.trim() || normalizeSlug(input.title);

  if (videos.some((video) => video.id === id)) {
    return null;
  }

  const video: GalleryVideo = {
    ...input,
    id,
  };

  galleryVideos = [video, ...videos];
  saveJsonFile("gallery-videos.json", galleryVideos);

  return video;
}

export async function updateGalleryVideoRecord(id: string, input: Partial<GalleryVideoInput>) {
  const videos = await listGalleryVideoRecords();
  const existingVideo = videos.find((video) => video.id === id);

  if (!existingVideo) {
    return null;
  }

  const updatedVideo: GalleryVideo = {
    ...existingVideo,
    ...input,
    id: existingVideo.id,
  };

  galleryVideos = videos.map((video) => video.id === existingVideo.id ? updatedVideo : video);
  saveJsonFile("gallery-videos.json", galleryVideos);

  return updatedVideo;
}

export async function deleteGalleryVideoRecord(id: string) {
  const videos = await listGalleryVideoRecords();
  const existingVideo = videos.find((video) => video.id === id);

  if (!existingVideo) {
    return null;
  }

  galleryVideos = videos.filter((video) => video.id !== existingVideo.id);
  saveJsonFile("gallery-videos.json", galleryVideos);

  return existingVideo;
}

export async function resetGalleryVideoRecords() {
  galleryVideos = resetJsonFile("gallery-videos.json", await getGalleryVideos());

  return galleryVideos;
}

export function isGalleryAlbumInput(value: unknown): value is GalleryAlbumInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GalleryAlbumInput>;

  return (
    typeof candidate.slug === "string" &&
    candidate.slug.trim().length > 0 &&
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.category === "string" &&
    candidate.category.trim().length > 0 &&
    typeof candidate.description === "string" &&
    candidate.description.trim().length > 0 &&
    typeof candidate.coverImage === "string" &&
    candidate.coverImage.trim().length > 0 &&
    Array.isArray(candidate.photos) &&
    candidate.photos.every(isGalleryPhoto)
  );
}

export function isGalleryVideoInput(value: unknown): value is GalleryVideoInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GalleryVideoInput>;

  return (
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.description === "string" &&
    candidate.description.trim().length > 0 &&
    typeof candidate.thumbnail === "string" &&
    candidate.thumbnail.trim().length > 0 &&
    typeof candidate.duration === "string" &&
    candidate.duration.trim().length > 0 &&
    typeof candidate.publishedAt === "string" &&
    candidate.publishedAt.trim().length > 0
  );
}

function normalizePhotos(photos: GalleryPhoto[]) {
  return photos.map((photo, index) => ({
    id: photo.id?.trim() || `foto-${index + 1}`,
    title: photo.title.trim(),
    description: photo.description.trim(),
    image: photo.image.trim(),
    takenAt: photo.takenAt.trim(),
  }));
}

function isGalleryPhoto(value: unknown): value is GalleryPhoto {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GalleryPhoto>;

  return (
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.description === "string" &&
    candidate.description.trim().length > 0 &&
    typeof candidate.image === "string" &&
    candidate.image.trim().length > 0 &&
    typeof candidate.takenAt === "string" &&
    candidate.takenAt.trim().length > 0
  );
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export async function createGalleryPhotoRecord(albumSlug: string, input: Omit<GalleryPhoto, "id"> & { id?: string }) {
  const albums = await listGalleryAlbumRecords();
  const album = albums.find((candidate) => candidate.slug === albumSlug || candidate.id === albumSlug);

  if (!album) {
    return null;
  }

  const photo: GalleryPhoto = {
    id: input.id?.trim() || crypto.randomUUID(),
    title: input.title.trim(),
    description: input.description.trim(),
    image: input.image.trim(),
    takenAt: input.takenAt.trim(),
  };

  const updatedAlbum: GalleryAlbum = {
    ...album,
    photos: [...album.photos, photo],
    photoCount: album.photos.length + 1,
    updatedAt: new Date().toISOString(),
  };

  galleryAlbums = albums.map((candidate) => candidate.id === album.id ? updatedAlbum : candidate);
  saveJsonFile("gallery-albums.json", galleryAlbums);

  return { album: updatedAlbum, photo };
}

export async function updateGalleryPhotoRecord(albumSlug: string, photoId: string, input: Partial<GalleryPhoto>) {
  const albums = await listGalleryAlbumRecords();
  const album = albums.find((candidate) => candidate.slug === albumSlug || candidate.id === albumSlug);

  if (!album) {
    return null;
  }

  const existingPhoto = album.photos.find((photo) => photo.id === photoId);

  if (!existingPhoto) {
    return null;
  }

  const updatedPhoto: GalleryPhoto = {
    ...existingPhoto,
    ...input,
    id: existingPhoto.id,
    title: input.title?.trim() ?? existingPhoto.title,
    description: input.description?.trim() ?? existingPhoto.description,
    image: input.image?.trim() ?? existingPhoto.image,
    takenAt: input.takenAt?.trim() ?? existingPhoto.takenAt,
  };

  if (!isGalleryPhoto(updatedPhoto)) {
    return null;
  }

  const updatedAlbum: GalleryAlbum = {
    ...album,
    photos: album.photos.map((photo) => photo.id === existingPhoto.id ? updatedPhoto : photo),
    photoCount: album.photos.length,
    updatedAt: new Date().toISOString(),
  };

  galleryAlbums = albums.map((candidate) => candidate.id === album.id ? updatedAlbum : candidate);
  saveJsonFile("gallery-albums.json", galleryAlbums);

  return { album: updatedAlbum, photo: updatedPhoto };
}

export async function deleteGalleryPhotoRecord(albumSlug: string, photoId: string) {
  const albums = await listGalleryAlbumRecords();
  const album = albums.find((candidate) => candidate.slug === albumSlug || candidate.id === albumSlug);

  if (!album) {
    return null;
  }

  const existingPhoto = album.photos.find((photo) => photo.id === photoId);

  if (!existingPhoto) {
    return null;
  }

  const photos = album.photos.filter((photo) => photo.id !== existingPhoto.id);
  const updatedAlbum: GalleryAlbum = {
    ...album,
    photos,
    photoCount: photos.length,
    updatedAt: new Date().toISOString(),
  };

  galleryAlbums = albums.map((candidate) => candidate.id === album.id ? updatedAlbum : candidate);
  saveJsonFile("gallery-albums.json", galleryAlbums);

  return { album: updatedAlbum, photo: existingPhoto };
}

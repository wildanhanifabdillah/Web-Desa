export type GalleryStatus = "draft" | "published" | "archived";

export type GalleryAlbumRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  cover_image_url: string;
  cover_image_alt: string;
  status: GalleryStatus;
  published_at: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type GalleryPhotoRow = {
  id: string;
  album_id: string;
  title: string;
  description: string;
  image_url: string;
  image_alt: string;
  taken_at: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type GalleryVideoRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail_url: string;
  thumbnail_alt: string;
  video_url: string | null;
  duration_seconds: number | null;
  status: GalleryStatus;
  published_at: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type GalleryAlbumWithPhotosRow = GalleryAlbumRow & {
  photos: GalleryPhotoRow[];
};

export const galleryTableNames = {
  albums: "gallery_albums",
  photos: "gallery_photos",
  videos: "gallery_videos",
} as const;

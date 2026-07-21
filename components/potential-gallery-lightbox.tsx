"use client";

import { useEffect, useMemo, useState } from "react";

export type GalleryLightboxItem = {
  title: string;
  description: string;
  image: string;
  category?: string;
};

type PotentialGalleryLightboxProps = {
  items: GalleryLightboxItem[];
  cardClassName?: string;
  imageClassName?: string;
  bodyClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export function PotentialGalleryLightbox({
  items,
  cardClassName = "overflow-hidden rounded-lg border border-white/10 bg-white/10 backdrop-blur-md",
  imageClassName = "h-52 bg-cover bg-center",
  bodyClassName = "p-5",
  titleClassName = "text-lg font-semibold leading-7 text-white",
  descriptionClassName = "mt-2 text-sm leading-6 text-slate-300",
}: PotentialGalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex === null ? null : items[activeIndex];
  const activePosition = activeIndex === null ? 0 : activeIndex + 1;

  const hasMultipleItems = items.length > 1;

  const controls = useMemo(
    () => ({
      previous: () =>
        setActiveIndex((current) => {
          if (current === null) {
            return current;
          }

          return current === 0 ? items.length - 1 : current - 1;
        }),
      next: () =>
        setActiveIndex((current) => {
          if (current === null) {
            return current;
          }

          return current === items.length - 1 ? 0 : current + 1;
        }),
      close: () => setActiveIndex(null),
    }),
    [items.length],
  );

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        controls.close();
      }

      if (event.key === "ArrowLeft" && hasMultipleItems) {
        controls.previous();
      }

      if (event.key === "ArrowRight" && hasMultipleItems) {
        controls.next();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, controls, hasMultipleItems]);

  return (
    <>
      {items.map((item, index) => (
        <article key={`${item.category ?? "gallery"}-${item.title}`} className={cardClassName}>
          <button
            type="button"
            className={`${imageClassName} block w-full transition-transform duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-sage-200`}
            style={{ backgroundImage: `url(${item.image})` }}
            aria-label={`Buka foto ${item.title}`}
            onClick={() => setActiveIndex(index)}
          />
          <div className={bodyClassName}>
            {item.category ? (
              <span className="mb-2 inline-flex rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
                {item.category}
              </span>
            ) : null}
            <h4 className={titleClassName}>{item.title}</h4>
            <p className={descriptionClassName}>{item.description}</p>
          </div>
        </article>
      ))}

      {activeItem ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/92 px-3 py-4 text-white backdrop-blur-sm sm:px-4 sm:py-6"
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Tutup lightbox"
            onClick={controls.close}
          />
          <div className="relative z-10 grid max-h-full w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-2xl lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.36fr)]">
            <div
              className="min-h-[260px] bg-contain bg-center bg-no-repeat sm:min-h-[520px]"
              style={{ backgroundImage: `url(${activeItem.image})` }}
              aria-hidden="true"
            />
            <div className="flex flex-col border-t border-white/10 p-5 lg:border-l lg:border-t-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {activeItem.category ? (
                    <span className="inline-flex rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-sage-100">
                      {activeItem.category}
                    </span>
                  ) : null}
                  <h3 className="mt-3 text-2xl font-semibold leading-tight">
                    {activeItem.title}
                  </h3>
                </div>
                <button
                  type="button"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/20 text-xl font-semibold transition-colors hover:bg-white/10"
                  aria-label="Tutup lightbox"
                  onClick={controls.close}
                >
                  x
                </button>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {activeItem.description}
              </p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
                <span className="text-sm text-slate-400">
                  {activePosition} / {items.length}
                </span>
                {hasMultipleItems ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="h-10 rounded-md border border-white/20 px-4 text-sm font-semibold transition-colors hover:bg-white/10"
                      onClick={controls.previous}
                    >
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      className="h-10 rounded-md bg-white px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-sage-50"
                      onClick={controls.next}
                    >
                      Berikutnya
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}




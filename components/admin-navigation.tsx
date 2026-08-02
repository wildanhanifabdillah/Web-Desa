import Link from "next/link";

const adminNavigationItems = [
  { label: "Dasbor", href: "/admin" },
  { label: "Beranda Website", href: "/admin/homepage" },
  { label: "Perangkat Desa", href: "/admin/perangkat" },
  { label: "Berita", href: "/admin/berita" },
  { label: "Potensi", href: "/admin/potensi" },
  { label: "Statistik", href: "/admin/statistik" },
  { label: "Galeri", href: "/admin/galeri" },
  { label: "Transparansi", href: "/admin/transparansi" },
  { label: "Perdes & Dokumen", href: "/admin/dokumen" },
];

export function AdminNavigation({ activeHref }: { activeHref?: string }) {
  return (
    <nav className="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto py-3" aria-label="Menu admin">
        {adminNavigationItems.map((item) => {
          const isActive = activeHref
            ? item.href === activeHref || (item.href !== "/admin" && (activeHref.startsWith(`${item.href}/`) || activeHref.startsWith(`${item.href}?`)))
            : false;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold ${
                isActive
                  ? "bg-sage-700 text-white"
                  : "border border-slate-300 text-slate-700 transition-colors hover:border-sage-700 hover:text-sage-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import Image from "next/image";
import Link from "next/link";
import { fetchPublicApi, type ApiResponse } from "@/lib/public-api";
import type { SiteSettings } from "@/lib/site-settings";

export async function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const { data: settings } = await fetchPublicApi<ApiResponse<SiteSettings>>("/api/site-settings");

  return (
    <footer className="bg-slate-950 text-white">
      <div className="border-b border-white/10 bg-sage-900/20 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-100">
              {settings.footer.eyebrow}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              {settings.footer.tagline}
            </p>
          </div>
          <Link
            href={settings.footer.cta.href}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-sage-100 sm:w-auto"
          >
            {settings.footer.cta.label}
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.7fr_0.7fr_1fr] lg:px-8 lg:py-14">
        <div>
          <Link href="/" className="inline-flex items-center gap-3" aria-label={settings.brand.ariaLabel}>
            <span className="flex h-18 w-18 items-center justify-center">
              <Image
                src={settings.brand.logoUrl}
                alt={settings.brand.logoAlt}
                width={64}
                height={64}
                className="h-full w-full object-contain"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-100">
                {settings.brand.eyebrow}
              </span>
              <span className="mt-1 text-xl font-semibold">{settings.brand.name}</span>
            </span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
            {settings.footer.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2" aria-label="Media sosial Desa Keseneng">
            {settings.socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/10 text-white transition-colors hover:border-sage-200 hover:bg-sage-100 hover:text-sage-900"
                aria-label={item.label}
                title={item.label}
              >
                <SocialIcon name={item.icon} />
              </a>
            ))}
          </div>
        </div>

        <FooterColumn title="Navigasi">
          {settings.footer.quickLinks.map((item) => (
            <FooterLink key={item.href} href={item.href}>
              {item.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Publik">
          {settings.footer.publicLinks.map((item) => (
            <FooterLink key={item.href} href={item.href}>
              {item.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-100">
            Kontak Desa
          </h2>
          <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-300">
            {settings.footer.contacts.map((item) => (
              <InfoLine key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
            <p className="font-semibold text-white">{settings.footer.serviceHoursTitle}</p>
            <p className="mt-1">{settings.footer.serviceHours}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>&copy; {currentYear} {settings.footer.copyright}</p>
          <p>{settings.footer.credit}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-100">
        {title}
      </h2>
      <nav className="mt-4 grid gap-3" aria-label={title}>
        {children}
      </nav>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
    >
      {children}
    </Link>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-medium text-white">{value}</p>
    </div>
  );
}

function SocialIcon({ name }: { name: string }) {
  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M14.5 8H17V4.3c-.4-.1-1.8-.3-3.4-.3-3.4 0-5.6 2-5.6 5.7V13H4v4.1h4V24h4.2v-6.9h3.5l.6-4.1h-4.1V10c0-1.2.3-2 2.3-2Z" />
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17" cy="7" r="0.9" className="fill-current stroke-none" />
      </svg>
    );
  }

  if (name === "youtube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M22 8.1a3 3 0 0 0-2.1-2.1C18 5.5 12 5.5 12 5.5s-6 0-7.9.5A3 3 0 0 0 2 8.1 31 31 0 0 0 1.5 12a31 31 0 0 0 .5 3.9A3 3 0 0 0 4.1 18c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-3.9 31 31 0 0 0-.5-3.9ZM10 15V9l5.2 3L10 15Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M12 2a9.8 9.8 0 0 0-8.4 14.9L2.4 22l5.2-1.2A9.8 9.8 0 1 0 12 2Zm0 17.8c-1.5 0-2.9-.4-4.1-1.1l-.3-.2-3 .7.7-2.9-.2-.3A7.8 7.8 0 1 1 12 19.8Zm4.5-5.8c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.2.2-.3.2-.6.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.2-.2-.3-.5-.4Z" />
    </svg>
  );
}

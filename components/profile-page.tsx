import type { ProfileData } from "@/lib/profile";

type ProfilePageProps = {
  profile: ProfileData;
};

export function ProfilePage({ profile }: ProfilePageProps) {
  return (
    <main className="bg-stone-50 text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 pb-14 pt-28 text-white sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-24">
        <div className="absolute inset-0 -z-20 bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(15,23,42,0.96),rgba(15,23,42,0.78),rgba(63,111,74,0.42))]" />
        <div className="mx-auto max-w-7xl">
          <p className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage-100 backdrop-blur-md">
            {profile.hero.eyebrow}
          </p>
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.78fr)] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                {profile.hero.title}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-100 sm:text-lg">
                {profile.hero.description}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur-md sm:grid-cols-2 sm:p-4">
              {profile.hero.facts.map((item) => (
                <div key={item.label} className="rounded-md bg-white/10 p-4 sm:min-h-28">
                  <span className="text-xs uppercase tracking-[0.14em] text-slate-300">
                    {item.label}
                  </span>
                  <strong className="mt-2 block text-base font-semibold leading-6 sm:text-lg">
                    {item.value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProfileOverviewSection overview={profile.overview} />
      <GeographySection geography={profile.geography} />
      <VisionMissionSection visionMission={profile.visionMission} />
      <VillageOfficialsSection officials={profile.officials} />
    </main>
  );
}

function ProfileOverviewSection({
  overview,
}: {
  overview: ProfileData["overview"];
}) {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-24">
      <div>
        <p className="section-kicker">{overview.kicker}</p>
        <h2 className="mt-3 max-w-3xl text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
          {overview.title}
        </h2>
        <p className="mt-5 text-base leading-8 text-slate-600">
          {overview.description}
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-base leading-8 text-slate-600">{overview.body}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {overview.highlights.map((item) => (
            <article
              key={item.label}
              className="rounded-md border border-slate-200 bg-stone-50 p-4"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {item.label}
              </span>
              <strong className="mt-2 block text-sm leading-6 text-slate-900">
                {item.value}
              </strong>
            </article>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {overview.pillars.map((item) => (
            <span
              key={item}
              className="rounded-md bg-sage-50 px-4 py-3 text-sm font-semibold text-sage-800"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function GeographySection({
  geography,
}: {
  geography: ProfileData["geography"];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <div>
          <p className="section-kicker">{geography.kicker}</p>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
            {geography.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            {geography.description}
          </p>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {geography.stats.map((item) => (
              <div
                key={item.label}
                className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {item.label}
                </span>
                <strong className="mt-2 block text-base text-slate-950 sm:text-lg">
                  {item.value}
                </strong>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-sage-100 bg-sage-50 p-4">
            <h3 className="text-sm font-semibold text-sage-800">
              Batas wilayah
            </h3>
            <dl className="mt-3 grid gap-x-5 gap-y-3 text-sm text-slate-700 sm:grid-cols-2">
              {geography.borders.map((item) => (
                <div key={item.label}>
                  <dt className="font-semibold text-slate-950">{item.label}</dt>
                  <dd className="mt-1 leading-6">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function VisionMissionSection({
  visionMission,
}: {
  visionMission: ProfileData["visionMission"];
}) {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-24">
      <div className="rounded-lg bg-sage-800 p-5 text-white sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-100">
          {visionMission.visionLabel}
        </p>
        <h2 className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">
          {visionMission.visionTitle}
        </h2>
        <p className="mt-5 text-sm leading-7 text-sage-50">
          {visionMission.visionDescription}
        </p>
      </div>
      <div className="grid gap-4">
        {visionMission.missions.map((mission, index) => (
          <article
            key={mission.focus}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-sage-50 text-sm font-semibold text-sage-800">
                {index + 1}
              </span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Misi Desa
                </span>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">
                  {mission.focus}
                </h3>
              </div>
            </div>
            <p className="mt-4 text-base leading-7 text-slate-700">
              {mission.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function VillageOfficialsSection({
  officials,
}: {
  officials: ProfileData["officials"];
}) {
  return (
    <section className="bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="section-kicker text-sage-200">{officials.kicker}</p>
            <h2 className="mt-3 text-3xl font-semibold">{officials.title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {officials.description}
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200 backdrop-blur-md">
            {officials.items.length} perangkat terdata
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {officials.items.map((official) => (
            <article
              key={official.name}
              className="flex min-h-[280px] min-w-0 flex-col rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur-md transition-colors hover:bg-white/15"
            >
              <div className="flex items-start justify-between gap-4">
                {official.photoUrl ? (
                  <div
                    className="h-20 w-20 rounded-md bg-cover bg-center ring-1 ring-white/15"
                    style={{ backgroundImage: `url(${official.photoUrl})` }}
                    aria-label={official.photoAlt ?? official.name}
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-white text-lg font-semibold text-slate-950">
                    {getInitials(official.name)}
                  </div>
                )}
                {official.area ? (
                  <span className="rounded-md bg-sage-700 px-2.5 py-1 text-xs font-semibold text-white">
                    {official.area}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-5 break-words text-lg font-semibold leading-7 sm:text-xl">
                {official.name}
              </h3>
              <p className="mt-1 text-sm font-semibold text-sage-200">
                {official.role}
              </p>
              <p className="mt-4 flex-1 text-sm leading-6 text-slate-300">
                {official.focus}
              </p>
              {official.contact ? (
                <div className="mt-5 break-all rounded-md border border-white/10 bg-slate-950/35 px-3 py-2 text-xs text-slate-300">
                  {official.contact}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function getInitials(name: string) {
  return name
    .replace(/,.*$/, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}



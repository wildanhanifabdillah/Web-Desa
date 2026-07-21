"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

export function AdminLoginPage({ nextPath = "/admin" }: { nextPath?: string }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [loginOk, setLoginOk] = useState(false);

  const errors = useMemo(() => {
    const nextErrors: { username?: string; password?: string } = {};

    if (username.trim().length < 3) {
      nextErrors.username = "Username minimal 3 karakter.";
    }

    if (password.trim().length < 8) {
      nextErrors.password = "Kata sandi minimal 8 karakter.";
    }

    return nextErrors;
  }, [username, password]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setLoginMessage(null);
    setLoginOk(false);

    if (Object.keys(errors).length > 0) {
      setLoginMessage("Periksa username dan kata sandi terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setLoginMessage(payload?.error ?? "Login admin gagal.");
        return;
      }

      setLoginOk(true);
      setLoginMessage("Login berhasil. Mengalihkan ke dasbor admin.");
      window.location.assign(nextPath.startsWith("/admin") ? nextPath : "/admin");
    } catch {
      setLoginMessage("Tidak bisa menghubungi server login admin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid = Object.keys(errors).length === 0;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="bg-slate-950 px-6 py-8 text-white sm:px-8 lg:px-10 lg:py-12">
            <Link
              href="/"
              className="inline-flex rounded-md border border-white/20 px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-white/50"
            >
              Kembali ke website
            </Link>

            <p className="mt-10 text-sm font-semibold uppercase tracking-[0.18em] text-sage-200">
              Login Admin
            </p>
            <h1 className="mt-3 max-w-lg text-3xl font-semibold leading-tight sm:text-5xl">
              Pusat pengelolaan Desa Keseneng.
            </h1>
            <p className="mt-5 max-w-md text-base leading-8 text-slate-300">
              Masukkan username dan kata sandi admin untuk membuka dasbor pengelolaan konten website desa.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <InfoBadge label="Akses" value="Admin desa" />
              <InfoBadge label="Keamanan" value="Sesi terbatas" />
            </div>
          </aside>

          <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-12">
            <div>
              <h2 className="text-2xl font-semibold">Masuk admin</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Gunakan kredensial admin yang dikonfigurasi di server.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 grid gap-5" noValidate>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  autoComplete="username"
                  onChange={(event) => setUsername(event.target.value)}
                  className={`mt-2 h-12 w-full rounded-md border bg-white px-3 text-base text-slate-800 outline-none transition-colors focus:border-sage-700 ${
                    submitted && errors.username ? "border-red-300" : "border-slate-300"
                  }`}
                />
                {submitted && errors.username ? (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {errors.username}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Kata sandi
                </label>
                <input
                  type="password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                  className={`mt-2 h-12 w-full rounded-md border bg-white px-3 text-base text-slate-800 outline-none transition-colors focus:border-sage-700 ${
                    submitted && errors.password ? "border-red-300" : "border-slate-300"
                  }`}
                />
                {submitted && errors.password ? (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {errors.password}
                  </p>
                ) : null}
              </div>

              {submitted && loginMessage ? (
                <div
                  className={`rounded-md px-3 py-3 text-sm font-semibold ${
                    loginOk && isValid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {loginMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmitting ? "Memproses..." : "Masuk admin"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-4">
      <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
        {label}
      </span>
      <strong className="mt-1 block text-sm text-white">{value}</strong>
    </div>
  );
}


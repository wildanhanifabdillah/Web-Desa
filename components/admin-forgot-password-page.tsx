"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

export function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("admin@keseneng.desa.id");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetPath, setResetPath] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const error = useMemo(() => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return "Email admin tidak valid.";
    }

    return "";
  }, [email]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setMessage(null);
    setResetPath(null);
    setHasError(false);

    if (error) {
      setHasError(true);
      setMessage(error);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setHasError(true);
        setMessage(payload?.error ?? "Permintaan reset password gagal.");
        return;
      }

      setMessage(payload?.data?.message ?? "Instruksi reset password sudah diproses.");
      setResetPath(payload?.data?.resetPath ?? null);
    } catch {
      setHasError(true);
      setMessage("Tidak bisa menghubungi server reset password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="mx-auto grid min-h-screen max-w-5xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Link
            href="/admin/login"
            className="inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-sage-700 hover:text-sage-800"
          >
            Kembali ke login
          </Link>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-sage-700">
            Lupa Password
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
            Pulihkan akses admin lewat email terdaftar.
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-600">
            Masukkan email admin untuk membuat token reset password yang valid.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          noValidate
        >
          <h2 className="text-xl font-semibold">Form reset password</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sistem akan memproses permintaan reset untuk email admin terdaftar.
          </p>

          <div className="mt-6">
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Email admin
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`mt-2 h-11 w-full rounded-md border bg-white px-3 text-sm text-slate-700 outline-none focus:border-sage-700 ${
                submitted && error ? "border-red-300" : "border-slate-300"
              }`}
              placeholder="admin@keseneng.desa.id"
            />
            {submitted && error ? (
              <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>
            ) : null}
          </div>

          {submitted && message ? (
            <div
              className={`mt-5 rounded-md px-3 py-2 text-sm font-semibold ${
                hasError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {message}
            </div>
          ) : null}

          {resetPath ? (
            <Link
              href={resetPath}
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-md border border-sage-700 px-4 text-sm font-semibold text-sage-800 transition-colors hover:bg-sage-50"
            >
              Buka halaman reset password
            </Link>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Memproses..." : "Kirim instruksi reset"}
          </button>
        </form>
      </section>
    </main>
  );
}

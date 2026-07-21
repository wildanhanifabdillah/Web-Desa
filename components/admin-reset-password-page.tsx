"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

export function AdminResetPasswordPage({ token = "" }: { token?: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const errors = useMemo(() => {
    const nextErrors: { token?: string; password?: string; confirmPassword?: string } = {};

    if (token.trim().length < 20) {
      nextErrors.token = "Token reset tidak valid.";
    }

    if (password.trim().length < 8) {
      nextErrors.password = "Kata sandi baru minimal 8 karakter.";
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Konfirmasi kata sandi belum sama.";
    }

    return nextErrors;
  }, [token, password, confirmPassword]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setMessage(null);
    setHasError(false);

    if (Object.keys(errors).length > 0) {
      setHasError(true);
      setMessage(errors.token ?? "Periksa kembali kata sandi baru.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setHasError(true);
        setMessage(payload?.error ?? "Reset kata sandi gagal.");
        return;
      }

      setMessage("Kata sandi admin berhasil diperbarui. Silakan login ulang.");
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
            Reset Password
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
            Buat kata sandi admin yang baru.
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-600">
            Gunakan token reset yang diterbitkan dari permintaan lupa password.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          noValidate
        >
          <h2 className="text-xl font-semibold">Form kata sandi baru</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Masukkan kata sandi baru dan ulangi untuk memastikan tidak salah ketik.
          </p>

          {submitted && errors.token ? (
            <div className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {errors.token}
            </div>
          ) : null}

          <div className="mt-6 grid gap-5">
            <PasswordField
              label="Kata sandi baru"
              value={password}
              error={submitted ? errors.password : undefined}
              onChange={setPassword}
            />
            <PasswordField
              label="Konfirmasi kata sandi"
              value={confirmPassword}
              error={submitted ? errors.confirmPassword : undefined}
              onChange={setConfirmPassword}
            />
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Memproses..." : "Simpan kata sandi baru"}
          </button>
        </form>
      </section>
    </main>
  );
}

function PasswordField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </label>
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-2 h-11 w-full rounded-md border bg-white px-3 text-sm text-slate-700 outline-none focus:border-sage-700 ${
          error ? "border-red-300" : "border-slate-300"
        }`}
      />
      {error ? (
        <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

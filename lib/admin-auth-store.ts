export type AdminUserStatus = "active" | "inactive" | "suspended";

export type AdminUserRecord = {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  role: "super_admin" | "editor" | "viewer";
  status: AdminUserStatus;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  lastLoginAt: string | null;
  passwordResetTokenHash: string | null;
  passwordResetExpiresAt: string | null;
};

export type AdminLoginInput = {
  username: string;
  password: string;
};

type AdminSessionPayload = {
  sid: string;
  sub: string;
  exp: number;
  iat: number;
};

const sessionDurationSeconds = 60 * 60 * 8;
const passwordResetDurationSeconds = 60 * 30;
const maxFailedAttempts = 5;
const lockoutDurationMs = 15 * 60 * 1000;

let adminUsers: AdminUserRecord[] | null = null;
const revokedSessionIds = new Set<string>();

export async function authenticateAdmin(input: AdminLoginInput) {
  const username = normalizeUsername(input.username);
  const password = input.password;

  if (username.length < 3 || password.trim().length < 8) {
    return {
      ok: false as const,
      status: 400,
      error: "Username atau kata sandi tidak valid.",
    };
  }

  const users = getAdminUsers();

  if (users.length === 0) {
    return {
      ok: false as const,
      status: 503,
      error: "Kredensial admin backend belum dikonfigurasi.",
    };
  }

  const user = users.find(
    (candidate) => candidate.username === username || candidate.email === username,
  );

  if (!user) {
    return {
      ok: false as const,
      status: 401,
      error: "Username atau kata sandi salah.",
    };
  }

  if (user.status !== "active") {
    return {
      ok: false as const,
      status: 403,
      error: "Akun admin tidak aktif.",
    };
  }

  if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
    return {
      ok: false as const,
      status: 423,
      error: "Akun admin terkunci sementara karena terlalu banyak percobaan login.",
    };
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= maxFailedAttempts) {
      user.lockedUntil = new Date(Date.now() + lockoutDurationMs).toISOString();
    }

    return {
      ok: false as const,
      status: 401,
      error: "Username atau kata sandi salah.",
    };
  }

  const now = Date.now();
  const payload: AdminSessionPayload = {
    sid: crypto.randomUUID(),
    sub: user.id,
    iat: now,
    exp: now + sessionDurationSeconds * 1000,
  };
  const token = await signSessionPayload(payload, user);

  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  user.lastLoginAt = new Date(now).toISOString();

  return {
    ok: true as const,
    user: serializeAdminUser(user),
    session: {
      id: payload.sid,
      token,
      expiresAt: new Date(payload.exp).toISOString(),
      maxAge: sessionDurationSeconds,
    },
  };
}

export async function getAdminSessionByToken(token: string | null | undefined) {
  const payload = await verifySessionToken(token);

  if (!payload || revokedSessionIds.has(payload.sid)) {
    return null;
  }

  const user = getAdminUsers().find((candidate) => candidate.id === payload.sub) ?? null;

  if (!user || user.status !== "active") {
    return null;
  }

  return {
    session: {
      id: payload.sid,
      expiresAt: new Date(payload.exp).toISOString(),
      createdAt: new Date(payload.iat).toISOString(),
    },
    user: serializeAdminUser(user),
  };
}

export async function revokeAdminSession(token: string | null | undefined) {
  const payload = await verifySessionToken(token);

  if (!payload) {
    return false;
  }

  revokedSessionIds.add(payload.sid);

  return true;
}

export async function requestAdminPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return {
      ok: false as const,
      status: 400,
      error: "Email admin tidak valid.",
    };
  }

  const user = getAdminUsers().find((candidate) => candidate.email === normalizedEmail);
  let resetToken: string | null = null;

  if (user && user.status === "active") {
    resetToken = createRandomToken();
    user.passwordResetTokenHash = await sha256(resetToken);
    user.passwordResetExpiresAt = new Date(
      Date.now() + passwordResetDurationSeconds * 1000,
    ).toISOString();
  }

  return {
    ok: true as const,
    message: "Jika email terdaftar, instruksi reset kata sandi akan dikirim.",
    expiresIn: passwordResetDurationSeconds,
    resetPath: resetToken ? `/admin/reset-password?token=${encodeURIComponent(resetToken)}` : null,
  };
}
export async function resetAdminPassword({
  token,
  password,
}: {
  token: string;
  password: string;
}) {
  if (token.trim().length < 20 || password.trim().length < 8) {
    return {
      ok: false as const,
      status: 400,
      error: "Token reset atau kata sandi baru tidak valid.",
    };
  }

  const tokenHash = await sha256(token);
  const user = getAdminUsers().find(
    (candidate) =>
      candidate.passwordResetTokenHash === tokenHash &&
      candidate.passwordResetExpiresAt &&
      new Date(candidate.passwordResetExpiresAt).getTime() > Date.now(),
  );

  if (!user) {
    return {
      ok: false as const,
      status: 400,
      error: "Token reset tidak valid atau sudah kedaluwarsa.",
    };
  }

  user.passwordHash = await sha256(password);
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  revokedSessionIds.clear();

  return {
    ok: true as const,
    user: serializeAdminUser(user),
  };
}

export const adminSessionCookieName = "admin_session";

function getAdminUsers() {
  if (!adminUsers) {
    adminUsers = createConfiguredAdminUsers();
  }

  return adminUsers;
}

function createConfiguredAdminUsers(): AdminUserRecord[] {
  const username = normalizeUsername(process.env.ADMIN_USERNAME || "admin");
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@keseneng.desa.id";
  const passwordHash = process.env.ADMIN_PASSWORD_SHA256?.trim();

  if (!passwordHash) {
    return [];
  }

  return [
    {
      id: "8f6d9f84-4a52-4d6b-8a57-200000000001",
      name: process.env.ADMIN_NAME?.trim() || "Administrator Desa Keseneng",
      username,
      email,
      passwordHash,
      role: "super_admin",
      status: "active",
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    },
  ];
}

function serializeAdminUser(user: AdminUserRecord) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
  };
}

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

async function verifyPassword(password: string, passwordHash: string) {
  return (await sha256(password)) === passwordHash;
}

async function signSessionPayload(payload: AdminSessionPayload, user: AdminUserRecord) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await signValue(encodedPayload, getSessionSecret(user));

  return `${encodedPayload}.${signature}`;
}

async function verifySessionToken(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const payload = parseSessionPayload(encodedPayload);

  if (!payload || payload.exp <= Date.now()) {
    return null;
  }

  const user = getAdminUsers().find((candidate) => candidate.id === payload.sub);

  if (!user) {
    return null;
  }

  const expectedSignature = await signValue(encodedPayload, getSessionSecret(user));

  return timingSafeEqual(signature, expectedSignature) ? payload : null;
}

function parseSessionPayload(encodedPayload: string): AdminSessionPayload | null {
  try {
    const parsed = JSON.parse(decodeBase64Url(encodedPayload)) as Partial<AdminSessionPayload>;

    if (
      typeof parsed.sid !== "string" ||
      typeof parsed.sub !== "string" ||
      typeof parsed.iat !== "number" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }

    return parsed as AdminSessionPayload;
  } catch {
    return null;
  }
}

function getSessionSecret(user: AdminUserRecord) {
  return `${process.env.ADMIN_SESSION_SECRET ?? "desa-keseneng-admin-session"}.${user.passwordHash}`;
}

async function signValue(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));

  return encodeBase64UrlBytes(new Uint8Array(signature));
}

function createRandomToken() {
  return `${crypto.randomUUID()}.${crypto.randomUUID()}`;
}

export async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function encodeBase64Url(value: string) {
  return encodeBase64UrlBytes(new TextEncoder().encode(value));
}

function encodeBase64UrlBytes(value: Uint8Array) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");

  return Buffer.from(padded, "base64").toString("utf8");
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;

  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
}

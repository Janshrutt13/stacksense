import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";

// ─── Constants ────────────────────────────────────────────────────────────
export const AUTH_COOKIE_NAME = "stacksense-session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters long");
  }
  return new TextEncoder().encode(secret);
}

// ─── Password Hashing ────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ─── JWT Session Management ──────────────────────────────────────────────
export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // Create a DB session record
  const session = await db.session.create({
    data: {
      userId,
      token: crypto.randomUUID(),
      expiresAt,
    },
  });

  // Sign a JWT containing the session token
  const jwt = await new SignJWT({ sessionToken: session.token, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresAt)
    .setIssuedAt()
    .sign(getSecret());

  return { jwt, expiresAt };
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sessionToken = payload.sessionToken as string;

    if (!sessionToken) return null;

    // Look up the DB session
    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });

    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session
      if (session) {
        await db.session.delete({ where: { id: session.id } }).catch(() => {});
      }
      return null;
    }

    return {
      userId: session.userId,
      user: session.user,
    };
  } catch {
    return null;
  }
}

export async function deleteSession(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sessionToken = payload.sessionToken as string;
    if (sessionToken) {
      await db.session
        .delete({ where: { token: sessionToken } })
        .catch(() => {});
    }
  } catch {
    // Token invalid or expired — nothing to delete
  }
}

// ─── Cookie Helpers ──────────────────────────────────────────────────────
export async function setSessionCookie(jwt: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

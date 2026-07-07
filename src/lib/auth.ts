import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "legalos-super-secret-key";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("legalos_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { userId } = verifyToken(token);
    return userId;
  } catch {
    return null;
  }
}

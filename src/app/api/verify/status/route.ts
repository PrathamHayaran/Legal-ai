import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getSessionUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const p: any = prisma as any;
    const latest = await p.verificationResult.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ ok: true, latest });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

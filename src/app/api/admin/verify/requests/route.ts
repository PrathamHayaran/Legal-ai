import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const callerId = await getSessionUser();
  if (!callerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const caller = await prisma.user.findUnique({ where: { id: callerId } });
  if (!caller || caller.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const p: any = prisma as any;
    const requests = await p.verificationResult.findMany({
      where: {
        status: { in: ["PENDING", "PARTIALLY_VERIFIED", "IDENTITY_VERIFIED", "BAR_VERIFIED"] },
      },
      include: {
        user: true,
        lawyerProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, requests });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

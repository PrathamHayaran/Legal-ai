import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const callerId = await getSessionUser();
  if (!callerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const caller = await prisma.user.findUnique({ where: { id: callerId } });
  if (!caller || caller.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { verificationId, action, reason } = body;
    const p: any = prisma as any;

    if (action === "approve") {
      await p.verificationResult.update({ where: { id: verificationId }, data: { status: "FULLY_VERIFIED" } });
    } else if (action === "reject") {
      await p.verificationResult.update({ where: { id: verificationId }, data: { status: "REJECTED" } });
    } else if (action === "request_more") {
      await p.verificationHistory.create({ data: { verificationId, action: "REQUEST_MORE_INFO", details: reason || null, performedByUserId: callerId } });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

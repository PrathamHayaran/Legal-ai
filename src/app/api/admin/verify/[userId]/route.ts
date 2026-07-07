import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const callerId = await getSessionUser();
  if (!callerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const caller = await prisma.user.findUnique({ where: { id: callerId } });
  if (!caller || caller.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { userId } = await context.params;
    const requestRecords = await prisma.verificationResult.findMany({
      where: { userId },
      include: {
        user: true,
        lawyerProfile: true,
        documents: true,
        history: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ok: true, list: requestRecords });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

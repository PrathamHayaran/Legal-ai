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
    const requests = await p.verificationResult.findMany({ include: { user: true, lawyerProfile: true } });
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const pendingVerifications = requests.filter((item: any) => ["PENDING", "PARTIALLY_VERIFIED", "IDENTITY_VERIFIED", "BAR_VERIFIED"].includes(item.status)).length;
    const approvedToday = requests.filter((item: any) => item.status === "FULLY_VERIFIED" && new Date(item.updatedAt) >= todayStart).length;
    const rejected = requests.filter((item: any) => item.status === "REJECTED").length;
    const averageConfidence = requests.length > 0 ? Math.round(requests.reduce((sum: number, item: any) => sum + (item.confidence || 0), 0) / requests.length) : 0;

    const reviewTimes = requests
      .map((item: any) => {
        const created = new Date(item.createdAt);
        const updated = new Date(item.updatedAt);
        return Math.max(0, (updated.getTime() - created.getTime()) / (1000 * 60 * 60));
      })
      .filter((hours: number) => hours >= 0);
    const averageReviewTimeHours = reviewTimes.length > 0 ? Math.round(reviewTimes.reduce((sum: number, value: number) => sum + value, 0) / reviewTimes.length) : 0;

    return NextResponse.json({ ok: true, stats: { pendingVerifications, approvedToday, rejected, averageConfidence, averageReviewTimeHours } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { runVerificationForUser } from "@/lib/verification-service";

export async function POST(req: Request) {
  const userId = await getSessionUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await runVerificationForUser(userId);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

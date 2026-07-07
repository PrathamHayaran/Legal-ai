import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { lawyerProfile: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const verificationStatus = user.role === "LAWYER" ? user.lawyerProfile?.verificationStatus ?? "PENDING" : "APPROVED";
    const token = signToken({ userId: user.id });
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          verificationStatus,
        },
      },
      { status: 200 }
    );

    response.cookies.set("legalos_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("/api/auth/signin error:", error);
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 });
  }
}

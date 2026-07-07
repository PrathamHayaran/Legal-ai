import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const lawyers = await prisma.lawyerProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ lawyers });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, barNumber, practiceArea, country, state, language, bio, hourlyRate, experienceYears } = body;

    const lawyer = await prisma.lawyerProfile.create({
      data: {
        userId,
        barNumber,
        practiceArea,
        country,
        state,
        language,
        bio,
        hourlyRate,
        experienceYears,
      },
    });

    return NextResponse.json({ lawyer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create lawyer profile" }, { status: 500 });
  }
}

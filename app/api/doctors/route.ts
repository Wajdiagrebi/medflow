import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const doctors = await prisma.user.findMany({
      where: {
        role: "DOCTOR",
        clinicId: session.user.clinicId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(doctors);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


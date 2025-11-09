import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { patientSchema } from "@/utils/validators";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const patients = await prisma.patient.findMany({
      where: { clinicId: session.user.clinicId },
      orderBy: { name: "asc" },
    });

    // return the array directly so clients that expect Patient[] can map over it
    return NextResponse.json(patients);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = patientSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const newPatient = await prisma.patient.create({
      data: { ...parsed.data, clinicId: session.user.clinicId },
    });

    return NextResponse.json({ patient: newPatient }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

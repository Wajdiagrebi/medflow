// app/api/admin/patients/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { patientSchema } from "@/utils/validators";
import { z } from "zod";

// ------------------------
// GET → récupérer tous les patients d'une clinique
// ------------------------
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patients = await prisma.patient.findMany({
      where: { clinicId: session.user.clinicId },
    });

    return NextResponse.json({ patients });
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de récupérer les patients" },
      { status: 500 }
    );
  }
}

// ------------------------
// POST → ajouter un patient
// ------------------------
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = patientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const newPatient = await prisma.patient.create({
      data: {
        ...parsed.data,
        clinicId: session.user.clinicId, // lien avec la clinique de l’admin
      },
    });

    return NextResponse.json({ patient: newPatient });
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de créer le patient" },
      { status: 500 }
    );
  }
}

// ------------------------
// PUT → modifier un patient
// ------------------------
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = patientSchema.extend({ id: z.string() }).safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await prisma.patient.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        age: parsed.data.age,
        condition: parsed.data.condition,
      },
    });

    return NextResponse.json({ patient: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de modifier le patient" },
      { status: 500 }
    );
  }
}

// ------------------------
// DELETE → supprimer un patient
// ------------------------
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.patient.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de supprimer le patient" },
      { status: 500 }
    );
  }
}

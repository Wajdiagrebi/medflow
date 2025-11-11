import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(2),
  type: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.number().positive(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const services = await prisma.service.findMany({
      where: {
        clinicId: session.user.clinicId,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ services });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!session.user.clinicId) {
      return NextResponse.json({ error: "ClinicId manquant dans la session" }, { status: 400 });
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ error: "Données JSON invalides" }, { status: 400 });
    }
    
    // Nettoyer les données : convertir les chaînes vides en null pour les champs optionnels
    const cleanedData = {
      name: body.name?.trim() || "",
      type: body.type && body.type.trim() !== "" ? body.type.trim() : null,
      description: body.description && body.description.trim() !== "" ? body.description.trim() : null,
      price: body.price ? parseFloat(body.price) : 0,
    };

    // Validation avec Zod
    const validationResult = serviceSchema.safeParse(cleanedData);
    if (!validationResult.success) {
      const errorMessages: string[] = [];
      validationResult.error.issues.forEach((err) => {
        const field = err.path.join(".");
        const message = err.message;
        errorMessages.push(`${field}: ${message}`);
      });
      return NextResponse.json({ 
        error: "Erreur de validation",
        message: "Les données fournies sont invalides",
        details: errorMessages.join(", ")
      }, { status: 400 });
    }

    const data = validationResult.data;

    const service = await prisma.service.create({
      data: {
        name: data.name,
        type: data.type || null,
        description: data.description || null,
        price: data.price,
        clinicId: session.user.clinicId,
      },
    });
    return NextResponse.json(service, { status: 201 });
  } catch (err: any) {
    console.error("Erreur lors de la création du service:", err);
    return NextResponse.json({ 
      error: err.message || "Erreur serveur",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined
    }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(service);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

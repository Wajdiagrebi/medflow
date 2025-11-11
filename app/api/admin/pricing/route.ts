import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

const pricingSchema = z.object({
  serviceId: z.string(),
  price: z.number().positive(),
  currency: z.string().default("TND"),
  isActive: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Utiliser la table Service qui a déjà un champ price
    const services = await prisma.service.findMany({
      where: {
        clinicId: session.user.clinicId,
      },
      orderBy: { createdAt: "desc" },
    });

    // Transformer les services en format pricing
    const pricings = services.map((service) => ({
      id: service.id,
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      currency: "TND", // Par défaut
      isActive: true,
      createdAt: service.createdAt instanceof Date 
        ? service.createdAt.toISOString() 
        : service.createdAt,
    }));

    return NextResponse.json({ pricings, services });
  } catch (error: any) {
    console.error("Erreur lors de la récupération des tarifs:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = pricingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Vérifier que le service existe
    const existingService = await prisma.service.findUnique({
      where: { id: parsed.data.serviceId },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour le prix du service
    const service = await prisma.service.update({
      where: { id: parsed.data.serviceId },
      data: {
        price: parsed.data.price,
      },
    });

    const pricing = {
      id: service.id,
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      currency: parsed.data.currency,
      isActive: parsed.data.isActive ?? true,
      createdAt: service.createdAt.toISOString(),
    };

    return NextResponse.json({ pricing }, { status: 201 });
  } catch (error: any) {
    console.error("Erreur lors de la création du tarif:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, price } = body;

    if (!id || !price) {
      return NextResponse.json(
        { error: "ID et prix requis" },
        { status: 400 }
      );
    }

    const service = await prisma.service.update({
      where: { id },
      data: { price: parseFloat(price) },
    });

    const pricing = {
      id: service.id,
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      currency: "TND",
      isActive: true,
      createdAt: service.createdAt.toISOString(),
    };

    return NextResponse.json({ pricing });
  } catch (error: any) {
    console.error("Erreur lors de la modification du tarif:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    // Pour l'instant, on ne supprime pas le service, juste on désactive le tarif
    // Ou on peut supprimer le service si nécessaire
    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur lors de la suppression du tarif:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}


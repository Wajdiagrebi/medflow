import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query || query.length < 2) {
      return NextResponse.json({
        patients: [],
        appointments: [],
        consultations: [],
        invoices: [],
        services: [],
      });
    }

    const clinicId = session.user.clinicId;
    if (!clinicId) {
      return NextResponse.json({ error: "ClinicId manquant" }, { status: 400 });
    }

    const searchTerm = `%${query}%`;

    // Recherche dans les patients
    const patients = await prisma.patient.findMany({
      where: {
        clinicId,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { condition: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        condition: true,
      },
      take: 5,
    });

    // Recherche dans les rendez-vous
    const appointments = await prisma.appointment.findMany({
      where: {
        Patient: { clinicId },
        OR: [
          { Patient: { name: { contains: query, mode: "insensitive" } } },
          { Patient: { email: { contains: query, mode: "insensitive" } } },
          { Doctor: { name: { contains: query, mode: "insensitive" } } },
          { reason: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        reason: true,
        Patient: { select: { name: true, email: true } },
        Doctor: { select: { name: true, email: true } },
      },
      take: 5,
      orderBy: { startTime: "desc" },
    });

    // Recherche dans les consultations
    const consultations = await prisma.consultation.findMany({
      where: {
        patient: {
          clinicId,
        },
        OR: [
          { patient: { name: { contains: query, mode: "insensitive" } } },
          { patient: { email: { contains: query, mode: "insensitive" } } },
          { doctor: { name: { contains: query, mode: "insensitive" } } },
          { diagnosis: { contains: query, mode: "insensitive" } },
          { notes: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        diagnosis: true,
        notes: true,
        createdAt: true,
        patient: { select: { name: true, email: true } },
        doctor: { select: { name: true, email: true } },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Recherche dans les factures
    const invoices = await prisma.invoice.findMany({
      where: {
        clinicId,
        OR: [
          { patient: { name: { contains: query, mode: "insensitive" } } },
          { patient: { email: { contains: query, mode: "insensitive" } } },
          { status: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        patient: { select: { name: true, email: true } },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Recherche dans les services
    const services = await prisma.service.findMany({
      where: {
        clinicId,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { type: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        price: true,
      },
      take: 5,
    });

    return NextResponse.json({
      patients: patients.map((p) => ({
        ...p,
        type: "patient",
        url: `/admin/patients`,
      })),
      appointments: appointments.map((a) => ({
        ...a,
        type: "appointment",
        url: `/admin/appointments`,
      })),
      consultations: consultations.map((c) => ({
        ...c,
        type: "consultation",
        url: `/doctor/consultations`,
      })),
      invoices: invoices.map((i) => ({
        ...i,
        type: "invoice",
        url: `/admin/invoices`,
      })),
      services: services.map((s) => ({
        ...s,
        serviceType: s.type, // Renommer pour éviter le conflit avec le type de résultat
        type: "service",
        url: `/admin/dashboard/services`,
      })),
    });
  } catch (error: any) {
    console.error("Erreur lors de la recherche:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}


"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pill, User, Calendar, Clock, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Prescription {
  id: string;
  medications?: string;
  instructions?: string;
  pdfUrl?: string;
  createdAt: string;
  patient: { name: string; email: string; age: number };
  doctor: { name: string; email: string };
  consultation: {
    id: string;
    diagnosis: string;
    createdAt: string;
    patient: { name: string };
  };
}

export default function PatientPrescriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchPrescription();
    }
  }, [params.id]);

  const fetchPrescription = async () => {
    try {
      const res = await fetch(`/api/prescriptions/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setPrescription(data);
      } else {
        alert("Prescription introuvable");
        router.push("/patient/prescriptions");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la prescription:", error);
      alert("Erreur lors du chargement de la prescription");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const parseMedications = (medications?: string) => {
    if (!medications) return [];
    try {
      const parsed = JSON.parse(medications);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-8 text-gray-500">Prescription introuvable</div>
      </div>
    );
  }

  const meds = parseMedications(prescription.medications);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/patient/prescriptions"
          className="text-green-600 hover:text-green-800 flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Pill className="w-8 h-8 text-green-600" />
            Détails de la Prescription
          </h1>
          {prescription.pdfUrl && (
            <a
              href={prescription.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Télécharger PDF
            </a>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Informations principales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de la Prescription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Date de création</p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  {formatDate(prescription.createdAt)}
                </p>
              </div>
              {prescription.pdfUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">PDF disponible</p>
                  <p className="text-green-600">✓ Oui</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Docteur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Médecin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Nom</p>
              <p className="font-semibold">{prescription.doctor.name}</p>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
              <p>{prescription.doctor.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Consultation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Consultation Associée
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Diagnostic</p>
              <p>{prescription.consultation.diagnosis}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Date de consultation</p>
              <p>{formatDate(prescription.consultation.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Médicaments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5" />
              Médicaments Prescrits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {meds.length > 0 ? (
              <div className="space-y-4">
                {meds.map((med: any, index: number) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="font-semibold text-lg">
                      {index + 1}. {med.name || med.medication || "Médicament"}
                    </p>
                    {med.dosage && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Dosage:</span> {med.dosage}
                      </p>
                    )}
                    {med.duration && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Durée:</span> {med.duration}
                      </p>
                    )}
                    {med.frequency && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Fréquence:</span> {med.frequency}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : prescription.medications ? (
              <p className="whitespace-pre-wrap">{prescription.medications}</p>
            ) : (
              <p className="text-gray-500">Aucun médicament prescrit</p>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        {prescription.instructions && (
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-gray-700">{prescription.instructions}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


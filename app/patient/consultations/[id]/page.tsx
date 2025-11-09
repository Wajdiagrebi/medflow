"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, User, Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Consultation {
  id: string;
  diagnosis: string;
  notes?: string;
  createdAt: string;
  patient: { name: string; email: string; age: number };
  doctor: { name: string; email: string };
  appointment?: {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
  };
}

export default function PatientConsultationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchConsultation();
    }
  }, [params.id]);

  const fetchConsultation = async () => {
    try {
      const res = await fetch(`/api/consultations/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setConsultation(data);
      } else {
        alert("Consultation introuvable");
        router.push("/patient/consultations");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la consultation:", error);
      alert("Erreur lors du chargement de la consultation");
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

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-8 text-gray-500">Consultation introuvable</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/patient/consultations"
          className="text-purple-600 hover:text-purple-800 flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8 text-purple-600" />
          Détails de la Consultation
        </h1>
      </div>

      <div className="space-y-6">
        {/* Informations principales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de la Consultation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Date de consultation</p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  {formatDate(consultation.createdAt)}
                </p>
              </div>
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
              <p className="font-semibold">{consultation.doctor.name}</p>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
              <p>{consultation.doctor.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Rendez-vous */}
        {consultation.appointment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Rendez-vous Associé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Date et heure</p>
                <p>{formatDate(consultation.appointment.startTime)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Statut</p>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    consultation.appointment.status === "DONE"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {consultation.appointment.status}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Diagnostic */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Diagnostic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-gray-700">{consultation.diagnosis}</p>
          </CardContent>
        </Card>

        {/* Notes */}
        {consultation.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-gray-700">{consultation.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


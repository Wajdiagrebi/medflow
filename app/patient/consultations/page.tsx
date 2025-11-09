"use client";

import { useState, useEffect } from "react";
import { FileText, User, Calendar, Eye } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Consultation {
  id: string;
  diagnosis: string;
  notes?: string;
  createdAt: string;
  doctor: { name: string; email: string };
  appointment?: {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
  };
}

export default function PatientConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const res = await fetch("/api/consultations");
      if (res.ok) {
        const data = await res.json();
        // Filtrer les consultations du patient connecté (côté client pour l'instant)
        // TODO: Filtrer côté serveur avec l'ID du patient connecté
        setConsultations(data || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des consultations:", error);
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

  const filteredConsultations = consultations.filter((consultation) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      consultation.diagnosis.toLowerCase().includes(term) ||
      consultation.doctor.name.toLowerCase().includes(term) ||
      (consultation.notes && consultation.notes.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8 text-purple-600" />
          Mes Consultations
        </h1>
      </div>

      {/* Recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher par diagnostic, docteur, notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-3 rounded w-full max-w-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {/* Liste des consultations */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      ) : filteredConsultations.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>
            {searchTerm
              ? "Aucune consultation ne correspond à votre recherche"
              : "Aucune consultation pour le moment"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConsultations.map((consultation) => (
            <Card key={consultation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Consultation
                  </CardTitle>
                  <Link
                    href={`/patient/consultations/${consultation.id}`}
                    className="text-purple-600 hover:text-purple-800"
                    title="Voir les détails"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Docteur:</span>
                  <span>{consultation.doctor.name}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-1">Diagnostic:</p>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {consultation.diagnosis}
                  </p>
                </div>
                {consultation.appointment && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">Rendez-vous:</p>
                    <p className="text-xs text-gray-600">
                      {formatDate(consultation.appointment.startTime)}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(consultation.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


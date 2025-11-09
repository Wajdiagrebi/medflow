"use client";

import { useState, useEffect } from "react";
import { Pill, User, Calendar, Download, Eye } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Prescription {
  id: string;
  medications?: string;
  instructions?: string;
  pdfUrl?: string;
  createdAt: string;
  doctor: { name: string; email: string };
  consultation: {
    id: string;
    diagnosis: string;
    createdAt: string;
  };
}

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch("/api/prescriptions");
      if (res.ok) {
        const data = await res.json();
        // Filtrer les prescriptions du patient connecté (côté client pour l'instant)
        // TODO: Filtrer côté serveur avec l'ID du patient connecté
        setPrescriptions(data || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des prescriptions:", error);
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

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      prescription.consultation.diagnosis.toLowerCase().includes(term) ||
      prescription.doctor.name.toLowerCase().includes(term) ||
      (prescription.instructions && prescription.instructions.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Pill className="w-8 h-8 text-green-600" />
          Mes Prescriptions
        </h1>
      </div>

      {/* Recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher par diagnostic, docteur, instructions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-3 rounded w-full max-w-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Liste des prescriptions */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <Pill className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>
            {searchTerm
              ? "Aucune prescription ne correspond à votre recherche"
              : "Aucune prescription pour le moment"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrescriptions.map((prescription) => {
            const meds = parseMedications(prescription.medications);
            return (
              <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Pill className="w-5 h-5 text-green-600" />
                      Prescription
                    </CardTitle>
                    <Link
                      href={`/patient/prescriptions/${prescription.id}`}
                      className="text-green-600 hover:text-green-800"
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
                    <span>{prescription.doctor.name}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">Diagnostic:</p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {prescription.consultation.diagnosis}
                    </p>
                  </div>
                  {meds.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1">Médicaments:</p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {meds.length} médicament(s) prescrit(s)
                      </p>
                    </div>
                  )}
                  {prescription.pdfUrl && (
                    <div className="pt-2 border-t">
                      <a
                        href={prescription.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 flex items-center gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger PDF
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(prescription.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


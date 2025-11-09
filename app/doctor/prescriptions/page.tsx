"use client";

import { useEffect, useState } from "react";
import { FileText, User, Calendar, Eye, Plus, Search, Download } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  medications?: string;
  instructions?: string;
  pdfUrl?: string;
  createdAt: string;
  patient: { name: string; email: string };
  doctor: { name: string; email: string };
  consultation: {
    id: string;
    diagnosis: string;
    createdAt: string;
  };
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch("/api/prescriptions");
      const data = await res.json();
      setPrescriptions(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      prescription.patient.name.toLowerCase().includes(term) ||
      prescription.patient.email.toLowerCase().includes(term) ||
      prescription.consultation.diagnosis.toLowerCase().includes(term) ||
      prescription.doctor.name.toLowerCase().includes(term)
    );
  });

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          Prescriptions
        </h1>
        <Link
          href="/doctor/prescriptions/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Prescription
        </Link>
      </div>

      {/* Recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par patient, diagnostic, docteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-3 pl-10 rounded w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{prescriptions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avec PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {prescriptions.filter((p) => p.pdfUrl).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ce Mois</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {
                prescriptions.filter((p) => {
                  const date = new Date(p.createdAt);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des prescriptions */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
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
                      <FileText className="w-5 h-5 text-blue-600" />
                      Prescription
                    </CardTitle>
                    <Link
                      href={`/doctor/prescriptions/${prescription.id}`}
                      className="text-blue-600 hover:text-blue-800"
                      title="Voir les détails"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Patient:</span>
                    <span>{prescription.patient.name}</span>
                  </div>
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
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm"
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


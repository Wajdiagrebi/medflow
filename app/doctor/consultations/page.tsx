"use client";

import { useEffect, useState } from "react";
import { FileText, User, Calendar, Clock, Eye, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  diagnosis: string;
  notes?: string;
  createdAt: string;
  patient: { name: string; email: string };
  doctor: { name: string; email: string };
  appointment?: {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
  };
}

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const res = await fetch("/api/consultations");
      const data = await res.json();
      setConsultations(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des consultations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConsultations = consultations.filter((consultation) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      consultation.patient.name.toLowerCase().includes(term) ||
      consultation.patient.email.toLowerCase().includes(term) ||
      consultation.diagnosis.toLowerCase().includes(term) ||
      consultation.doctor.name.toLowerCase().includes(term)
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          Consultations
        </h1>
        <Link
          href="/doctor/consultations/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Consultation
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
            <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{consultations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avec Rendez-vous</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {consultations.filter((c) => c.appointmentId).length}
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
                consultations.filter((c) => {
                  const date = new Date(c.createdAt);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length
              }
            </p>
          </CardContent>
        </Card>
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
                    <FileText className="w-5 h-5 text-blue-600" />
                    Consultation
                  </CardTitle>
                  <Link
                    href={`/doctor/consultations/${consultation.id}`}
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
                  <span>{consultation.patient.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Docteur:</span>
                  <span>{consultation.doctor.name}</span>
                </div>
                {consultation.appointment && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">RDV:</span>
                    <span>
                      {new Date(consultation.appointment.startTime).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-1">Diagnostic:</p>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {consultation.diagnosis}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                  <Clock className="w-3 h-3" />
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


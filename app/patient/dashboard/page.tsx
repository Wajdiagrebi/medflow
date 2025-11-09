"use client";

import { useState, useEffect } from "react";
import { Calendar, FileText, Pill, DollarSign, Clock, Plus, Eye } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  reason?: string;
  Doctor: { name: string; email: string };
}

interface Consultation {
  id: string;
  diagnosis: string;
  createdAt: string;
  doctor: { name: string };
}

interface Prescription {
  id: string;
  createdAt: string;
  pdfUrl?: string;
  consultation: { diagnosis: string };
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Récupérer les rendez-vous
      const appointmentsRes = await fetch("/api/appointments");
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData || []);
      }

      // Récupérer les consultations (filtrées côté client pour le patient connecté)
      const consultationsRes = await fetch("/api/consultations");
      if (consultationsRes.ok) {
        const consultationsData = await consultationsRes.json();
        setConsultations(consultationsData || []);
      }

      // Récupérer les prescriptions (filtrées côté client pour le patient connecté)
      const prescriptionsRes = await fetch("/api/prescriptions");
      if (prescriptionsRes.ok) {
        const prescriptionsData = await prescriptionsRes.json();
        setPrescriptions(prescriptionsData || []);
      }

      // Récupérer les factures (filtrées côté client pour le patient connecté)
      const invoicesRes = await fetch("/api/invoices");
      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.startTime) >= new Date() && apt.status === "SCHEDULED"
  );

  const todayAppointments = appointments.filter(
    (apt) =>
      new Date(apt.startTime).toDateString() === new Date().toDateString() &&
      apt.status === "SCHEDULED"
  );

  const pendingInvoices = invoices.filter((inv) => inv.status === "PENDING");

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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="w-8 h-8 text-blue-600" />
          Mon Tableau de Bord
        </h1>
        <p className="text-gray-600 mt-2">Bienvenue sur votre espace patient</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Rendez-vous Aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{todayAppointments.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600" />
              Rendez-vous à Venir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{consultations.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-red-600" />
              Factures en Attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingInvoices.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link
          href="/patient/appointments/new"
          className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition flex items-center gap-3"
        >
          <Plus className="w-5 h-5" />
          <div>
            <p className="font-semibold">Prendre un Rendez-vous</p>
            <p className="text-sm opacity-90">Réserver une consultation</p>
          </div>
        </Link>

        <Link
          href="/patient/appointments"
          className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition flex items-center gap-3"
        >
          <Calendar className="w-5 h-5" />
          <div>
            <p className="font-semibold">Mes Rendez-vous</p>
            <p className="text-sm opacity-90">Voir tous mes rendez-vous</p>
          </div>
        </Link>

        <Link
          href="/patient/dashboard/invoices"
          className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition flex items-center gap-3"
        >
          <DollarSign className="w-5 h-5" />
          <div>
            <p className="font-semibold">Mes Factures</p>
            <p className="text-sm opacity-90">Voir et payer mes factures</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rendez-vous à venir */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Rendez-vous à Venir
              </CardTitle>
              <Link
                href="/patient/appointments"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Voir tout
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucun rendez-vous à venir
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className="border p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          {formatDate(apt.startTime)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Dr. {apt.Doctor?.name || "N/A"}
                        </p>
                        {apt.reason && (
                          <p className="text-sm text-gray-500 mt-1">
                            {apt.reason}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          apt.status === "SCHEDULED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consultations récentes */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Consultations Récentes
              </CardTitle>
              <Link
                href="/patient/consultations"
                className="text-purple-600 hover:text-purple-800 text-sm"
              >
                Voir tout
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {consultations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucune consultation
              </p>
            ) : (
              <div className="space-y-3">
                {consultations.slice(0, 3).map((consult) => (
                  <div
                    key={consult.id}
                    className="border p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <p className="font-semibold">{consult.diagnosis}</p>
                    <p className="text-sm text-gray-600">
                      Dr. {consult.doctor?.name || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(consult.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prescriptions récentes */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-green-600" />
                Prescriptions Récentes
              </CardTitle>
              <Link
                href="/patient/prescriptions"
                className="text-green-600 hover:text-green-800 text-sm"
              >
                Voir tout
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {prescriptions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucune prescription
              </p>
            ) : (
              <div className="space-y-3">
                {prescriptions.slice(0, 3).map((presc) => (
                  <div
                    key={presc.id}
                    className="border p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <p className="font-semibold">
                      {presc.consultation?.diagnosis || "Prescription"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(presc.createdAt)}
                    </p>
                    {presc.pdfUrl && (
                      <a
                        href={presc.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                      >
                        Télécharger PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Factures en attente */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-600" />
                Factures en Attente
              </CardTitle>
              <Link
                href="/patient/dashboard/invoices"
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Voir tout
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingInvoices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucune facture en attente
              </p>
            ) : (
              <div className="space-y-3">
                {pendingInvoices.slice(0, 3).map((inv) => (
                  <div
                    key={inv.id}
                    className="border p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">${inv.amount}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(inv.createdAt)}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

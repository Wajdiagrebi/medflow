"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, User, UserPlus, CalendarPlus, Users, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "CANCELLED" | "DONE";
  reason?: string;
  Patient: { name: string; email: string };
  Doctor: { name: string; email: string };
}

export default function ReceptionDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    today: 0,
    upcoming: 0,
    patients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Récupérer les rendez-vous du jour
      const appointmentsRes = await fetch("/api/admin/appointments?filter=day");
      const appointmentsData = await appointmentsRes.json();
      const todayAppointments = appointmentsData.appointments || [];

      // Récupérer tous les rendez-vous pour calculer les stats
      const allAppointmentsRes = await fetch("/api/appointments");
      const allAppointmentsData = await allAppointmentsRes.json();
      
      // Vérifier que la réponse est un tableau
      // Si c'est un objet avec une propriété error, utiliser un tableau vide
      const allAppointments = Array.isArray(allAppointmentsData) 
        ? allAppointmentsData 
        : allAppointmentsData.appointments || [];

      // Récupérer les patients
      const patientsRes = await fetch("/api/patients");
      const patientsData = await patientsRes.json();
      const patients = Array.isArray(patientsData) ? patientsData : [];

      // Calculer les stats
      const now = new Date();
      const upcoming = allAppointments.filter((apt: Appointment) => {
        const startTime = new Date(apt.startTime);
        return startTime > now && apt.status === "SCHEDULED";
      });

      setAppointments(todayAppointments);
      setStats({
        today: todayAppointments.length,
        upcoming: upcoming.length,
        patients: patients.length || 0,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      // En cas d'erreur, initialiser avec des valeurs par défaut
      setStats({
        today: 0,
        upcoming: 0,
        patients: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "DONE":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "Planifié";
      case "DONE":
        return "Terminé";
      case "CANCELLED":
        return "Annulé";
      default:
        return status;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Trier les rendez-vous par heure
  const sortedAppointments = [...appointments].sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  // Filtrer les rendez-vous à venir aujourd'hui
  const upcomingToday = sortedAppointments.filter((apt) => {
    const startTime = new Date(apt.startTime);
    const now = new Date();
    return startTime >= now && apt.status === "SCHEDULED";
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Réceptionniste</h1>
        <div className="flex gap-2">
          <Link
            href="/reception/appointments"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <CalendarPlus className="w-5 h-5" />
            Gérer les Rendez-vous
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendez-vous Aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-2xl font-bold">...</p>
            ) : (
              <p className="text-2xl font-bold">{stats.today}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {upcomingToday.length} à venir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendez-vous à Venir</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-2xl font-bold">...</p>
            ) : (
              <p className="text-2xl font-bold">{stats.upcoming}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Tous les rendez-vous planifiés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients Totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-2xl font-bold">...</p>
            ) : (
              <p className="text-2xl font-bold">{stats.patients}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Patients enregistrés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/reception/appointments?action=create"
          className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-blue-200 hover:border-blue-400"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <CalendarPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Nouveau Rendez-vous</h3>
              <p className="text-sm text-gray-600">Créer un rendez-vous</p>
            </div>
          </div>
        </Link>

        <Link
          href="/patients"
          className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-green-200 hover:border-green-400"
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Nouveau Patient</h3>
              <p className="text-sm text-gray-600">Enregistrer un patient</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/invoices"
          className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-purple-200 hover:border-purple-400"
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">Factures</h3>
              <p className="text-sm text-gray-600">Gérer les factures</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Rendez-vous du jour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Rendez-vous d'Aujourd'hui
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-4">Chargement...</p>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Aucun rendez-vous prévu pour aujourd'hui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAppointments.map((appt) => {
                const isUpcoming = upcomingToday.some((a) => a.id === appt.id);
                return (
                  <div
                    key={appt.id}
                    className={`p-4 rounded-lg border-2 ${
                      isUpcoming
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">
                            {formatTime(appt.startTime)} - {formatTime(appt.endTime)}
                          </span>
                          {isUpcoming && (
                            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                              À venir
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Patient:</span>
                            <span>{appt.Patient?.name || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Docteur:</span>
                            <span>{appt.Doctor?.name || "N/A"}</span>
                          </div>
                          {appt.reason && (
                            <div className="mt-2 text-gray-600">
                              <span className="font-medium">Raison:</span> {appt.reason}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(appt.status)}`}
                        >
                          {getStatusLabel(appt.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertes */}
      {upcomingToday.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">
              {upcomingToday.length} rendez-vous à venir aujourd'hui
            </h3>
            <p className="text-sm text-yellow-700">
              Assurez-vous que les patients sont bien accueillis à leur arrivée.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

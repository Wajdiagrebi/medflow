"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, Plus, Eye, X } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  reason?: string;
  Doctor: { name: string; email: string };
  Patient: { name: string; email: string };
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = await res.json();
        // Filtrer les rendez-vous du patient connecté (côté client pour l'instant)
        // TODO: Filtrer côté serveur avec l'ID du patient connecté
        setAppointments(data || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des rendez-vous:", error);
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

  const filteredAppointments = appointments.filter((apt) => {
    const now = new Date();
    const startTime = new Date(apt.startTime);

    if (filter === "upcoming") {
      return startTime >= now && apt.status === "SCHEDULED";
    } else if (filter === "past") {
      return startTime < now || apt.status === "DONE" || apt.status === "CANCELLED";
    }
    return true;
  });

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="w-8 h-8 text-blue-600" />
          Mes Rendez-vous
        </h1>
        <Link
          href="/patient/appointments/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Prendre un Rendez-vous
        </Link>
      </div>

      {/* Filtres */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setFilter("upcoming")}
          className={`px-4 py-2 rounded ${
            filter === "upcoming"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          À Venir
        </button>
        <button
          onClick={() => setFilter("past")}
          className={`px-4 py-2 rounded ${
            filter === "past"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Passés
        </button>
      </div>

      {/* Liste des rendez-vous */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Aucun rendez-vous {filter === "upcoming" ? "à venir" : filter === "past" ? "passé" : ""}</p>
          {filter !== "upcoming" && (
            <Link
              href="/patient/appointments/new"
              className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
            >
              Prendre un rendez-vous
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Rendez-vous
                  </CardTitle>
                  <span
                    className={`px-2 py-1 rounded text-xs ${getStatusColor(appointment.status)}`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Date:</span>
                  <span>{formatDate(appointment.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Docteur:</span>
                  <span>{appointment.Doctor?.name || "N/A"}</span>
                </div>
                {appointment.reason && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">Raison:</p>
                    <p className="text-sm text-gray-700">{appointment.reason}</p>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    Durée: {Math.round((new Date(appointment.endTime).getTime() - new Date(appointment.startTime).getTime()) / 60000)} minutes
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


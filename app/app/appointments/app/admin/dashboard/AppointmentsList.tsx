"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react"; // Assure-toi que lucide-react est installé
import clsx from "clsx"; // petit utilitaire pour fusionner des classNames (optionnel)

// ✅ Types pour plus de clarté
interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
}

interface AppointmentsListProps {
  className?: string;
}

export default function AppointmentsList({ className }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/appointments")
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data.appointments || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement des rendez-vous...</p>;

  if (appointments.length === 0)
    return (
      <div className="text-gray-500 text-sm">
        Aucun rendez-vous prévu pour aujourd’hui.
      </div>
    );

  return (
    <div className={clsx("space-y-3", className)}>
      {appointments.map((a) => (
        <div
          key={a.id}
          className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="text-blue-600" size={18} />
            <span className="font-semibold text-gray-800">
              Rendez-vous #{a.id}
            </span>
          </div>
          <p className="text-sm text-gray-700">👤 Patient : {a.patientId}</p>
          <p className="text-sm text-gray-700">👨‍⚕️ Docteur : {a.doctorId}</p>
          <p className="text-sm text-gray-500">
            📅 {new Date(a.date).toLocaleString("fr-FR")}
          </p>
        </div>
      ))}
    </div>
  );
}


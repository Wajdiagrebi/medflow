"use client";

// Réutiliser la même page que l'admin pour la gestion des rendez-vous
// Le réceptionniste a les mêmes permissions que l'admin pour les rendez-vous
import AdminAppointmentsPage from "@/app/admin/appointments/page";

export default function ReceptionAppointmentsPage() {
  return <AdminAppointmentsPage />;
}


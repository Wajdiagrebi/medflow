"use client";

import { useState, useEffect } from "react";
import { User, Calendar, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Patient {
  id: string;
  name: string;
  email: string;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  status: string;
  Patient: { name: string };
  Doctor: { name: string };
}

export default function NewConsultationPage() {
  const [form, setForm] = useState({
    patientId: "",
    appointmentId: "",
    diagnosis: "",
    notes: "",
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
  }, []);

  useEffect(() => {
    // Si un patient est sélectionné, charger ses rendez-vous
    if (form.patientId) {
      fetchAppointmentsForPatient(form.patientId);
    } else {
      setAppointments([]);
      setForm((prev) => ({ ...prev, appointmentId: "" }));
    }
  }, [form.patientId]);

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des patients:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      // Filtrer seulement les rendez-vous terminés ou planifiés
      const filtered = (data || []).filter(
        (apt: Appointment) => apt.status === "SCHEDULED" || apt.status === "DONE"
      );
      setAppointments(filtered);
    } catch (error) {
      console.error("Erreur lors du chargement des rendez-vous:", error);
    }
  };

  const fetchAppointmentsForPatient = async (patientId: string) => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      const filtered = (data || []).filter(
        (apt: Appointment) =>
          apt.patientId === patientId &&
          (apt.status === "SCHEDULED" || apt.status === "DONE")
      );
      setAppointments(filtered);
    } catch (error) {
      console.error("Erreur lors du chargement des rendez-vous:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: form.patientId.trim(),
          appointmentId: form.appointmentId && form.appointmentId.trim() !== "" ? form.appointmentId.trim() : undefined,
          diagnosis: form.diagnosis.trim(),
          notes: form.notes && form.notes.trim() !== "" ? form.notes.trim() : undefined,
        }),
      });

      const result = await res.json();
      console.log("API Response:", { status: res.status, result });
      console.log("Request body sent:", {
        patientId: form.patientId,
        appointmentId: form.appointmentId || undefined,
        diagnosis: form.diagnosis,
        notes: form.notes || undefined,
      });
      
      if (res.ok) {
        alert("Consultation enregistrée avec succès!");
        // Réinitialiser le formulaire
        setForm({ patientId: "", appointmentId: "", diagnosis: "", notes: "" });
        // Rediriger vers la liste des consultations
        window.location.href = "/doctor/consultations";
      } else {
        let errorMessage = "Erreur lors de l'enregistrement";
        
        // Prioriser le message explicite avec détails
        if (result.details) {
          errorMessage = result.details;
        } else if (result.message) {
          errorMessage = result.message;
        } else if (result.error) {
          if (typeof result.error === "string") {
            errorMessage = result.error;
          } else if (result.error._errors && result.error._errors.length > 0) {
            errorMessage = result.error._errors[0];
          } else if (result.error.diagnosis?._errors) {
            errorMessage = `Diagnostic: ${result.error.diagnosis._errors[0]}`;
          } else if (result.error.patientId?._errors) {
            errorMessage = `Patient: ${result.error.patientId._errors[0]}`;
          } else if (result.error.doctorId?._errors) {
            errorMessage = `Docteur: ${result.error.doctorId._errors[0]}`;
          } else if (result.error.appointmentId?._errors) {
            errorMessage = `Rendez-vous: ${result.error.appointmentId._errors[0]}`;
          }
        }
        
        console.error("Erreur détaillée complète:", JSON.stringify(result, null, 2));
        alert(`Erreur: ${errorMessage}\n\nCode: ${res.status}\n\nVérifiez la console pour plus de détails.`);
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      alert("Erreur: " + (error.message || "Erreur inconnue"));
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = patients.find((p) => p.id === form.patientId);
  const selectedAppointment = appointments.find((a) => a.id === form.appointmentId);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href="/doctor/consultations"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          Nouvelle Consultation
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du patient */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Patient *
            </label>
            <select
              value={form.patientId}
              onChange={(e) => setForm({ ...form, patientId: e.target.value, appointmentId: "" })}
              className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionner un patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} ({patient.email})
                </option>
              ))}
            </select>
            {selectedPatient && (
              <p className="text-sm text-gray-600 mt-1">
                Patient sélectionné: {selectedPatient.name}
              </p>
            )}
          </div>

          {/* Sélection du rendez-vous (optionnel) */}
          {form.patientId && appointments.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Rendez-vous (optionnel)
              </label>
              <select
                value={form.appointmentId}
                onChange={(e) => setForm({ ...form, appointmentId: e.target.value })}
                className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Aucun rendez-vous lié</option>
                {appointments.map((appt) => (
                  <option key={appt.id} value={appt.id}>
                    {new Date(appt.startTime).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    - {appt.Doctor?.name || "N/A"} ({appt.status})
                  </option>
                ))}
              </select>
              {selectedAppointment && (
                <p className="text-sm text-gray-600 mt-1">
                  Rendez-vous: {new Date(selectedAppointment.startTime).toLocaleString("fr-FR")} avec{" "}
                  {selectedAppointment.Doctor?.name || "N/A"}
                </p>
              )}
            </div>
          )}

          {form.patientId && appointments.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
              Aucun rendez-vous disponible pour ce patient. Vous pouvez créer la consultation sans lier de rendez-vous.
            </div>
          )}

          {/* Diagnostic */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Diagnostic *
            </label>
            <textarea
              placeholder="Entrez le diagnostic..."
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              className="border p-3 rounded w-full min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              minLength={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 3 caractères
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Notes (optionnel)
            </label>
            <textarea
              placeholder="Notes supplémentaires, observations..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="border p-3 rounded w-full min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || loadingData}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? "Enregistrement..." : "Créer Consultation"}
            </button>
            <Link
              href="/doctor/consultations"
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded hover:bg-gray-300"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

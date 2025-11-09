"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

interface Doctor {
  id: string;
  name: string;
  email: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
}

export default function NewPatientAppointmentPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [form, setForm] = useState({
    doctorId: "",
    startTime: "",
    endTime: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Récupérer les docteurs
      const doctorsRes = await fetch("/api/doctors");
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json();
        setDoctors(doctorsData || []);
      }

      // Récupérer les patients (pour trouver le patient connecté)
      const patientsRes = await fetch("/api/patients");
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        setPatients(patientsData || []);
        // TODO: Sélectionner automatiquement le patient connecté
        // Pour l'instant, on prend le premier patient
        if (patientsData && patientsData.length > 0) {
          setSelectedPatient(patientsData[0].id);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient || !form.doctorId || !form.startTime || !form.endTime) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient,
          doctorId: form.doctorId,
          startTime: form.startTime,
          endTime: form.endTime,
          reason: form.reason || undefined,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Rendez-vous créé avec succès!");
        window.location.href = "/patient/appointments";
      } else {
        let errorMessage = "Erreur lors de la création du rendez-vous";
        if (result.error) {
          if (typeof result.error === "string") {
            errorMessage = result.error;
          } else if (result.error._errors && result.error._errors.length > 0) {
            errorMessage = result.error._errors[0];
          }
        }
        console.error("Erreur détaillée:", result);
        alert("Erreur: " + errorMessage);
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      alert("Erreur: " + (error.message || "Erreur inconnue"));
    } finally {
      setLoading(false);
    }
  };

  // Calculer l'heure de fin automatiquement (30 minutes par défaut)
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startTime = e.target.value;
    setForm({ ...form, startTime });
    
    if (startTime) {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + 30 * 60000); // +30 minutes
      const endTimeStr = end.toISOString().slice(0, 16);
      setForm((prev) => ({ ...prev, endTime: endTimeStr }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href="/patient/appointments"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Plus className="w-8 h-8 text-blue-600" />
          Prendre un Rendez-vous
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du docteur */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Docteur *
            </label>
            <select
              value={form.doctorId}
              onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
              className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionner un docteur</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name} ({doctor.email})
                </option>
              ))}
            </select>
          </div>

          {/* Date et heure de début */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Date et Heure de Début *
            </label>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={handleStartTimeChange}
              className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-gray-500 mt-1">
              L'heure de fin sera calculée automatiquement (30 minutes)
            </p>
          </div>

          {/* Date et heure de fin */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Date et Heure de Fin *
            </label>
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Raison */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Raison (optionnel)
            </label>
            <textarea
              placeholder="Raison de la consultation..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
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
              {loading ? "Création..." : "Créer le Rendez-vous"}
            </button>
            <Link
              href="/patient/appointments"
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


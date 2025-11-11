"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, User, UserCheck, X, Edit2 } from "lucide-react";

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

interface Patient {
  id: string;
  name: string;
  email: string;
}

interface Doctor {
  id: string;
  name: string;
  email: string;
}

export default function AdminAppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [filter, setFilter] = useState<"day" | "week" | "month">("day");
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    startTime: "",
    endTime: "",
    reason: "",
  });

  // Protection côté client : rediriger si non authentifié ou si pas admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    if (status === "authenticated" && session) {
      if (session.user.role !== "ADMIN") {
        router.push("/login");
        return;
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    // Ne charger les données que si l'utilisateur est authentifié et admin
    if (status === "authenticated" && session?.user.role === "ADMIN") {
      fetchAppointments();
      fetchPatients();
      fetchDoctors();
    }
  }, [filter, status, session]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`/api/admin/appointments?filter=${filter}`);
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Erreur lors du chargement des rendez-vous:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des patients:", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch("/api/doctors");
      const data = await res.json();
      setDoctors(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des docteurs:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    if (!form.patientId || !form.doctorId || !form.startTime || !form.endTime) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    const startDate = new Date(form.startTime);
    const endDate = new Date(form.endTime);
    
    if (endDate <= startDate) {
      alert("L'heure de fin doit être après l'heure de début");
      return;
    }
    
    setLoading(true);
    try {
      const url = editingAppointment
        ? `/api/appointments/${editingAppointment.id}`
        : "/api/admin/appointments";
      const method = editingAppointment ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: form.patientId,
          doctorId: form.doctorId,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          reason: form.reason,
        }),
      });

      let result: any = {};
      let responseText = "";
      
      try {
        responseText = await response.text();
        
        console.log("=== DÉTAILS DE LA RÉPONSE ===");
        console.log("Status:", response.status);
        console.log("Status Text:", response.statusText);
        console.log("Content-Type:", response.headers.get("content-type"));
        console.log("Réponse brute (longueur):", responseText.length);
        console.log("Réponse brute (contenu):", responseText);
        console.log("=============================");
        
        if (responseText && responseText.trim()) {
          try {
            result = JSON.parse(responseText);
            console.log("Données parsées avec succès:", result);
            console.log("Clés de l'objet result:", Object.keys(result));
            console.log("Type de result:", typeof result);
          } catch (parseError: any) {
            console.error("Erreur de parsing JSON:", parseError);
            console.error("Réponse qui n'est pas du JSON:", responseText);
            alert(`Erreur ${response.status}: Réponse invalide du serveur\n\nRéponse: ${responseText.substring(0, 200)}`);
            setLoading(false);
            return;
          }
        } else {
          console.warn("Réponse vide ou blanche du serveur");
          console.warn("responseText:", JSON.stringify(responseText));
          result = { error: `Réponse vide du serveur (${response.status})` };
        }
      } catch (textError: any) {
        console.error("Erreur lors de la lecture de la réponse:", textError);
        alert(`Erreur ${response.status}: Impossible de lire la réponse du serveur\n\n${textError.message || "Erreur inconnue"}`);
        setLoading(false);
        return;
      }

      if (response.ok) {
        setShowForm(false);
        setEditingAppointment(null);
        setForm({ patientId: "", doctorId: "", startTime: "", endTime: "", reason: "" });
        await fetchAppointments();
        alert(editingAppointment ? "Rendez-vous modifié avec succès!" : "Rendez-vous créé avec succès!");
      } else {
        // Afficher un message d'erreur plus détaillé
        let errorMessage = `Erreur ${response.status}: Erreur lors de l'opération`;
        
        if (result && Object.keys(result).length > 0) {
          // Gérer le nouveau format avec details
          if (result.details) {
            errorMessage = `Erreur ${response.status}: ${result.details}`;
          } else if (result.message) {
            errorMessage = `Erreur ${response.status}: ${result.message}`;
          } else if (result.error) {
            if (typeof result.error === "string") {
              errorMessage = `Erreur ${response.status}: ${result.error}`;
            } else if (result.error.message) {
              errorMessage = `Erreur ${response.status}: ${result.error.message}`;
            } else if (result.error._errors && result.error._errors.length > 0) {
              errorMessage = `Erreur ${response.status}: ${result.error._errors.join(", ")}`;
            } else if (result.error.endTime && result.error.endTime._errors) {
              errorMessage = `Erreur ${response.status}: ${result.error.endTime._errors[0]}`;
            } else if (result.error.startTime && result.error.startTime._errors) {
              errorMessage = `Erreur ${response.status}: ${result.error.startTime._errors[0]}`;
            } else if (result.error.patientId && result.error.patientId._errors) {
              errorMessage = `Erreur ${response.status}: ${result.error.patientId._errors[0]}`;
            } else if (result.error.doctorId && result.error.doctorId._errors) {
              errorMessage = `Erreur ${response.status}: ${result.error.doctorId._errors[0]}`;
            }
          }
        } else if (responseText) {
          errorMessage = `Erreur ${response.status}: ${responseText.substring(0, 100)}`;
        }
        
        console.error("Erreur API complète:", {
          status: response.status,
          statusText: response.statusText,
          result: result,
          responseText: responseText,
        });
        
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'opération: " + (error.message || "Erreur inconnue"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous?")) return;
    
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (response.ok) {
        await fetchAppointments();
        alert("Rendez-vous annulé avec succès!");
      } else {
        alert("Erreur lors de l'annulation");
      }
    } catch (error) {
      alert("Erreur lors de l'annulation");
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setForm({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      startTime: new Date(appointment.startTime).toISOString().slice(0, 16),
      endTime: new Date(appointment.endTime).toISOString().slice(0, 16),
      reason: appointment.reason || "",
    });
    setShowForm(true);
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

  // Ne rien afficher si l'utilisateur n'est pas authentifié ou n'est pas admin
  if (status === "loading") {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || (status === "authenticated" && session?.user.role !== "ADMIN")) {
    return null; // La redirection est en cours
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Rendez-vous</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingAppointment(null);
            setForm({ patientId: "", doctorId: "", startTime: "", endTime: "", reason: "" });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Calendar className="w-5 h-5" />
          {showForm ? "Annuler" : "Nouveau Rendez-vous"}
        </button>
      </div>

      {/* Filtres */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("day")}
          className={`px-4 py-2 rounded ${
            filter === "day" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Aujourd'hui
        </button>
        <button
          onClick={() => setFilter("week")}
          className={`px-4 py-2 rounded ${
            filter === "week" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Cette Semaine
        </button>
        <button
          onClick={() => setFilter("month")}
          className={`px-4 py-2 rounded ${
            filter === "month" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Ce Mois
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingAppointment ? "Modifier le Rendez-vous" : "Nouveau Rendez-vous"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Patient</label>
                <select
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Docteur</label>
                <select
                  value={form.doctorId}
                  onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="">Sélectionner un docteur</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date et Heure de début</label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => {
                    const startTime = e.target.value;
                    setForm({ ...form, startTime });
                    
                    // Calculer automatiquement l'heure de fin (30 minutes par défaut)
                    if (startTime && !form.endTime) {
                      const start = new Date(startTime);
                      const end = new Date(start.getTime() + 30 * 60000); // +30 minutes
                      const endTimeStr = end.toISOString().slice(0, 16);
                      setForm((prev) => ({ ...prev, startTime, endTime: endTimeStr }));
                    } else {
                      setForm({ ...form, startTime });
                    }
                  }}
                  className="border p-2 rounded w-full"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date et Heure de fin</label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="border p-2 rounded w-full"
                  required
                  min={form.startTime || new Date().toISOString().slice(0, 16)}
                />
                {form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime) && (
                  <p className="text-sm text-red-600 mt-1">
                    L'heure de fin doit être après l'heure de début
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Raison (optionnel)</label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="border p-2 rounded w-full"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Enregistrement..." : editingAppointment ? "Modifier" : "Créer"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAppointment(null);
                  setForm({ patientId: "", doctorId: "", startTime: "", endTime: "", reason: "" });
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des rendez-vous */}
      {loading && !appointments.length ? (
        <p className="text-center text-gray-500">Chargement...</p>
      ) : appointments.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Aucun rendez-vous pour cette période</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Rendez-vous
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(appt.status)}`}>
                    {getStatusLabel(appt.status)}
                  </span>
                </div>
                {appt.status === "SCHEDULED" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(appt)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancel(appt.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Annuler"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Patient:</span>
                  <span>{appt.Patient?.name || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Docteur:</span>
                  <span>{appt.Doctor?.name || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>
                    {new Date(appt.startTime).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-gray-400">-</span>
                  <span>
                    {new Date(appt.endTime).toLocaleString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {appt.reason && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-gray-600 text-xs">
                      <span className="font-medium">Raison:</span> {appt.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


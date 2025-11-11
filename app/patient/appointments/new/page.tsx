"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/Toast";

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
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({
    doctorId: "",
    startTime: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      // Récupérer les docteurs
      const doctorsRes = await fetch("/api/doctors");
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json();
        setDoctors(doctorsData || []);
      }

      // Trouver le patient connecté via son email
      if (session?.user?.email) {
        const patientsRes = await fetch("/api/patients");
        if (patientsRes.ok) {
          const patientsData = await patientsRes.json();
          const currentPatient = patientsData.find((p: Patient) => p.email === session.user.email);
          if (currentPatient) {
            setPatient(currentPatient);
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      showToast("Erreur lors du chargement des données", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patient || !form.doctorId || !form.startTime) {
      showToast("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }

    const startDate = new Date(form.startTime);
    // Calculer automatiquement l'heure de fin (30 minutes après le début)
    const endDate = new Date(startDate.getTime() + 30 * 60000);

    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          doctorId: form.doctorId,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          reason: form.reason || undefined,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        showToast("Rendez-vous créé avec succès!", "success");
        setTimeout(() => {
          window.location.href = "/patient/appointments";
        }, 1000);
      } else {
        let errorMessage = "Erreur lors de la création du rendez-vous";
        if (result.error) {
          if (typeof result.error === "string") {
            errorMessage = result.error;
          } else if (result.error._errors && result.error._errors.length > 0) {
            errorMessage = result.error._errors[0];
          }
        }
        showToast(errorMessage, "error");
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      showToast(error.message || "Erreur inconnue", "error");
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour l'heure de début (l'heure de fin sera calculée automatiquement lors de la soumission)
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, startTime: e.target.value });
  };

  if (loadingData) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Patient non trouvé. Veuillez contacter l'administration.</p>
            <Link href="/patient/dashboard">
              <Button variant="outline">Retour au tableau de bord</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <p className="text-gray-600 mt-2">Réservez votre consultation en ligne</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du Rendez-vous</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient (affiché en lecture seule) */}
            <div>
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Patient
              </Label>
              <Input
                value={`${patient.name} (${patient.email})`}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>

            {/* Sélection du docteur */}
            <div>
              <Label htmlFor="doctor" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Docteur *
              </Label>
              <Select
                value={form.doctorId}
                onValueChange={(value) => setForm({ ...form, doctorId: value })}
                required
                disabled={loading}
              >
                <SelectTrigger id="doctor" className="mt-1">
                  <SelectValue placeholder="Sélectionner un docteur" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name} ({doctor.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date et heure de début */}
            <div>
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Date et Heure de Début *
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={form.startTime}
                onChange={handleStartTimeChange}
                className="mt-1"
                required
                min={new Date().toISOString().slice(0, 16)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                La durée de la consultation est de 30 minutes.
              </p>
            </div>

            {/* Raison */}
            <div>
              <Label htmlFor="reason">Raison (optionnel)</Label>
              <Textarea
                id="reason"
                placeholder="Raison de la consultation..."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="mt-1 min-h-[100px]"
                disabled={loading}
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || loadingData}
                className="flex items-center gap-2"
              >
                {loading ? "Création..." : "Créer le Rendez-vous"}
              </Button>
              <Link href="/patient/appointments">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


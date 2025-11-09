"use client";

import { useState, useEffect } from "react";
import { FileText, User, Calendar, ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";

interface Consultation {
  id: string;
  patientId: string;
  diagnosis: string;
  createdAt: string;
  patient: { name: string; email: string };
}

interface Medication {
  name: string;
  dosage: string;
  duration: string;
  frequency?: string;
}

export default function NewPrescriptionPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<string>("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const res = await fetch("/api/consultations");
      const data = await res.json();
      // Filtrer seulement les consultations du docteur connecté
      setConsultations(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des consultations:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", duration: "", frequency: "" }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedConsultation) {
      alert("Veuillez sélectionner une consultation");
      return;
    }

    if (medications.length === 0) {
      alert("Veuillez ajouter au moins un médicament");
      return;
    }

    // Vérifier que tous les médicaments ont un nom
    if (medications.some((m) => !m.name.trim())) {
      alert("Veuillez remplir le nom de tous les médicaments");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId: selectedConsultation,
          medications: JSON.stringify(medications),
          instructions: instructions || undefined,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Prescription créée avec succès!");
        // Rediriger vers la liste
        window.location.href = "/doctor/prescriptions";
      } else {
        let errorMessage = "Erreur lors de l'enregistrement";
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

  const selectedConsultationData = consultations.find((c) => c.id === selectedConsultation);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href="/doctor/prescriptions"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          Nouvelle Prescription
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection de la consultation */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Consultation *
            </label>
            <select
              value={selectedConsultation}
              onChange={(e) => setSelectedConsultation(e.target.value)}
              className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionner une consultation</option>
              {consultations.map((consultation) => (
                <option key={consultation.id} value={consultation.id}>
                  {consultation.patient.name} - {consultation.diagnosis.substring(0, 50)}... (
                  {new Date(consultation.createdAt).toLocaleDateString("fr-FR")})
                </option>
              ))}
            </select>
            {selectedConsultationData && (
              <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm">
                  <span className="font-medium">Patient:</span> {selectedConsultationData.patient.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Diagnostic:</span> {selectedConsultationData.diagnosis}
                </p>
              </div>
            )}
          </div>

          {/* Médicaments */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Médicaments *
              </label>
              <button
                type="button"
                onClick={addMedication}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                Ajouter un médicament
              </button>
            </div>

            {medications.length === 0 ? (
              <div className="text-center py-4 text-gray-500 border border-dashed rounded">
                Aucun médicament ajouté. Cliquez sur "Ajouter un médicament" pour commencer.
              </div>
            ) : (
              <div className="space-y-4">
                {medications.map((med, index) => (
                  <div key={index} className="border p-4 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-sm">Médicament {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Nom du médicament *</label>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => updateMedication(index, "name", e.target.value)}
                          className="border p-2 rounded w-full text-sm"
                          placeholder="Ex: Paracétamol"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Dosage *</label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                          className="border p-2 rounded w-full text-sm"
                          placeholder="Ex: 500mg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Durée *</label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => updateMedication(index, "duration", e.target.value)}
                          className="border p-2 rounded w-full text-sm"
                          placeholder="Ex: 7 jours"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Fréquence (optionnel)</label>
                        <input
                          type="text"
                          value={med.frequency || ""}
                          onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                          className="border p-2 rounded w-full text-sm"
                          placeholder="Ex: 3 fois par jour"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium mb-2">Instructions (optionnel)</label>
            <textarea
              placeholder="Instructions supplémentaires pour le patient..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="border p-3 rounded w-full min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || loadingData || medications.length === 0}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? "Enregistrement..." : "Créer Prescription"}
            </button>
            <Link
              href="/doctor/prescriptions"
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


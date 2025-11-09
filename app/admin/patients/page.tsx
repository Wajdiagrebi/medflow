"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Edit, Trash2, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Patient {
  id: string;
  name: string;
  email: string;
  age: number;
  condition: string;
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    condition: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/admin/patients");
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPatient ? "/api/admin/patients" : "/api/admin/patients";
      const method = editingPatient ? "PUT" : "POST";
      
      const body = editingPatient
        ? { ...form, id: editingPatient.id, age: Number(form.age) }
        : { ...form, age: Number(form.age) };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingPatient(null);
        setForm({ name: "", email: "", age: "", condition: "" });
        await fetchPatients();
        alert(editingPatient ? "Patient modifié avec succès!" : "Patient créé avec succès!");
      } else {
        const result = await res.json();
        alert("Erreur: " + (result.error || "Impossible de sauvegarder"));
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      alert("Erreur: " + (error.message || "Erreur inconnue"));
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setForm({
      name: patient.name,
      email: patient.email,
      age: patient.age.toString(),
      condition: patient.condition || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) return;

    try {
      const res = await fetch("/api/admin/patients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        await fetchPatients();
        alert("Patient supprimé avec succès!");
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const filteredPatients = patients.filter((patient) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(term) ||
      patient.email.toLowerCase().includes(term) ||
      patient.condition.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8 text-blue-600" />
          Gestion des Patients
        </h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingPatient(null);
            setForm({ name: "", email: "", age: "", condition: "" });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau Patient
        </button>
      </div>

      {/* Recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-3 pl-10 rounded w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingPatient ? "Modifier le Patient" : "Nouveau Patient"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Âge *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Condition</label>
                  <input
                    type="text"
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="border p-2 rounded w-full"
                    placeholder="N/A"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingPatient ? "Modifier" : "Créer"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPatient(null);
                    setForm({ name: "", email: "", age: "", condition: "" });
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des patients */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>
            {searchTerm
              ? "Aucun patient ne correspond à votre recherche"
              : "Aucun patient pour le moment"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{patient.name}</CardTitle>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(patient)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(patient.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm">{patient.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Âge</p>
                  <p className="text-sm">{patient.age} ans</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Condition</p>
                  <p className="text-sm">{patient.condition || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


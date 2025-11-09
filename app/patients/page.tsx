"use client";

import useSWR from "swr";
import PatientForm from "../../components/PatientFormClient";
import PatientsList from "../../components/PatientsList";
import { Patient } from "../../types/patient";

const fetcher = async (url: string) => {
  const r = await fetch(url);
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Erreur de chargement");
  return data;
};

export default function PatientsPage() {
  const { data, error, mutate } = useSWR<Patient[]>("/api/patients", fetcher);

  const handleCreated = (p?: Patient) => {
    // optimistic update: append created patient then revalidate
    if (!p) return;
    mutate([... (data || []), p], false);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-blue-700 dark:text-blue-400 mb-8">
        Liste des Patients
      </h1>

      <div className="w-full max-w-2xl mb-8">
        <PatientForm onSuccess={handleCreated} />
      </div>

      {error && (
        <div className="text-red-600">{String(error.message || "Erreur lors du chargement des patients")}</div>
      )}
      {!data ? (
        <p className="text-gray-500 dark:text-gray-400 mt-4">Chargement...</p>
      ) : !Array.isArray(data) ? (
        <p className="text-gray-500 dark:text-gray-400 mt-4">Veuillez vous connecter pour voir les patients.</p>
      ) : data.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 mt-4">Aucun patient pour le moment.</p>
      ) : (
        <div className="w-full">
          <PatientsList patients={data} />
        </div>
      )}
    </main>
  );
}

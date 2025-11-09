"use client";

import { useState } from "react";

export default function OnboardingPage() {
  const [clinicName, setClinicName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Création en cours...");

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinicName, adminName, adminEmail, adminPassword }),
    });

    const data = await res.json();
    if (res.ok) setMessage("Clinique créée avec succès 🎉");
    else setMessage(`Erreur : ${data.error}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-blue-600">
          Onboarding Clinique
        </h1>

        <input
          type="text"
          placeholder="Nom de la clinique"
          value={clinicName}
          onChange={(e) => setClinicName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Nom de l’administrateur"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email de l’admin"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Créer la clinique
        </button>

        {message && <p className="text-center text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}

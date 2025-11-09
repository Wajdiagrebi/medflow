"use client";

import { useState } from "react";
import { Patient } from "../types/patient";

interface PatientFormProps {
  onSuccess?: (p?: Patient) => void;
}

export default function PatientFormClient({ onSuccess }: PatientFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [condition, setCondition] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name,
      email,
      age: parseInt(age || "0", 10),
      condition,
    };

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to create patient");
      }

  const created = await res.json();
  // the API returns { patient } but some callers expect the Patient directly
  onSuccess?.((created && created.patient) ? created.patient : (created as Patient));

      setName("");
      setEmail("");
      setAge("");
      setCondition("");
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow w-full">
      {error && <div className="text-red-600">{error}</div>}
      <input
        type="text"
        placeholder="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="number"
        placeholder="Âge"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="text"
        placeholder="Pathologie"
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}

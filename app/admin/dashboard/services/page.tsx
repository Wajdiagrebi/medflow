"use client";

import { useEffect, useState } from "react";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    const res = await fetch("/api/admin/services");
    const data = await res.json();
    setServices(data);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        clinicId: "clinic_001", // à remplacer par session.user.clinicId
      }),
    });
    setLoading(false);
    if (res.ok) {
      await fetchServices();
      setForm({ name: "", description: "", price: "" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce service ?")) return;
    await fetch("/api/admin/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchServices();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Services & Tarifs</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 space-y-3">
        <input
          type="text"
          placeholder="Nom du service"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="number"
          placeholder="Prix (en DT)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Ajout..." : "Ajouter Service"}
        </button>
      </form>

      <table className="w-full border-collapse bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Nom</th>
            <th className="p-2 text-left">Prix (DT)</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.price}</td>
              <td className="p-2">{s.description || "-"}</td>
              <td className="p-2 text-right">
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-red-600 hover:underline"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

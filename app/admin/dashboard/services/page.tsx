"use client";

import { useEffect, useState } from "react";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", type: "", description: "", price: "" });
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/admin/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Erreur lors du chargement des services:", errorData);
        setServices([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des services:", error);
      setServices([]);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validation côté client
      if (!form.name.trim()) {
        alert("Le nom du service est obligatoire");
        setLoading(false);
        return;
      }
      if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
        alert("Le prix doit être un nombre positif");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type.trim() || "",
          description: form.description.trim() || "",
          price: parseFloat(form.price),
        }),
      });

      let data: any = {};
      let responseText = "";
      
      try {
        responseText = await res.text();
        console.log("Réponse brute du serveur:", responseText);
        console.log("Status:", res.status);
        console.log("Status Text:", res.statusText);
        console.log("Headers:", Object.fromEntries(res.headers.entries()));
        
        if (responseText) {
          try {
            data = JSON.parse(responseText);
            console.log("Données parsées:", data);
          } catch (parseError) {
            console.error("Erreur de parsing JSON:", parseError);
            console.error("Réponse qui n'est pas du JSON:", responseText);
            alert(`Erreur ${res.status}: Réponse invalide du serveur\n\nRéponse: ${responseText.substring(0, 200)}`);
            setLoading(false);
            return;
          }
        } else {
          console.warn("Réponse vide du serveur");
          data = { error: `Réponse vide du serveur (${res.status})` };
        }
      } catch (textError) {
        console.error("Erreur lors de la lecture de la réponse:", textError);
        alert(`Erreur ${res.status}: Impossible de lire la réponse du serveur`);
        setLoading(false);
        return;
      }

      if (res.ok) {
        await fetchServices();
        setForm({ name: "", type: "", description: "", price: "" });
        alert("Service ajouté avec succès !");
      } else {
        console.error("Erreur API complète:", {
          status: res.status,
          statusText: res.statusText,
          data: data,
          responseText: responseText,
        });
        
        let errorMessage = `Erreur ${res.status}: Impossible d'ajouter le service`;
        
        if (data && Object.keys(data).length > 0) {
          if (data.error) {
            if (typeof data.error === "string") {
              errorMessage = `Erreur ${res.status}: ${data.error}`;
            } else if (data.error?.message) {
              errorMessage = `Erreur ${res.status}: ${data.error.message}`;
            } else if (data.error?._errors && data.error._errors.length > 0) {
              errorMessage = `Erreur ${res.status}: ${data.error._errors.join(", ")}`;
            } else if (data.details) {
              errorMessage = `Erreur ${res.status}: ${data.details}`;
            }
          } else if (data.message) {
            errorMessage = `Erreur ${res.status}: ${data.message}`;
          } else if (data.details) {
            errorMessage = `Erreur ${res.status}: ${data.details}`;
          }
        } else if (responseText) {
          errorMessage = `Erreur ${res.status}: ${responseText.substring(0, 100)}`;
        }
        
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du service:", error);
      alert(`Erreur: ${error.message || "Erreur lors de l'ajout du service. Veuillez réessayer."}`);
    } finally {
      setLoading(false);
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
          placeholder="Nom du service *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="Type de service (ex: Consultation, Examen, Vaccination)"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
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
          placeholder="Prix (en DT) *"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border p-2 rounded w-full"
          required
          min="0"
          step="0.01"
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
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2 text-left">Prix (DT)</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                Aucun service enregistré
              </td>
            </tr>
          ) : (
            services.map((s) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-2 font-medium">{s.name}</td>
                <td className="p-2">{s.type || "-"}</td>
                <td className="p-2">{s.description || "-"}</td>
                <td className="p-2 font-semibold">{s.price?.toFixed(2) || "0.00"}</td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

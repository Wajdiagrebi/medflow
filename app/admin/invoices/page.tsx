"use client";
import { useEffect, useState } from "react";
import { Download, FileText, DollarSign } from "lucide-react";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const [form, setForm] = useState({ patientId: "", amount: "" });

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, []);

  const fetchInvoices = async () => {
    try {
      const r = await fetch("/api/invoices");
      if (r.ok) {
        const data = await r.json();
        setInvoices(data.invoices || []);
      } else {
        console.error("Erreur lors du chargement des factures");
        setInvoices([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des factures:", error);
      setInvoices([]);
    }
  };

  const fetchPatients = async () => {
    try {
      const r = await fetch("/api/patients");
      if (r.ok) {
        const data = await r.json();
        setPatients(data.patients || []);
      } else {
        console.error("Erreur lors du chargement des patients");
        setPatients([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des patients:", error);
      setPatients([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: form.patientId,
          amount: Number(form.amount),
        }),
      });
      const result = await response.json();
      if (response.ok) {
        // Réinitialiser le formulaire
        setForm({ patientId: "", amount: "" });
        // Rafraîchir la liste
        await fetchInvoices();
        
        if (result.url) {
          // Ouvrir le lien de paiement Stripe dans un nouvel onglet
          window.open(result.url, "_blank");
          alert("Facture créée ! Lien de paiement ouvert dans un nouvel onglet.\n\nLe PDF a été généré automatiquement.");
        } else {
          alert("Facture créée avec succès !\n\nLe PDF a été généré automatiquement.");
        }
      } else {
        alert("Erreur: " + (result.error || "Impossible de créer la facture"));
      }
    } catch (error) {
      alert("Erreur lors de la création de la facture");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePdf = async (invoiceId: string) => {
    setGeneratingPdf(invoiceId);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      const result = await response.json();
      
      if (response.ok) {
        if (result.pdfUrl) {
          // Ouvrir le PDF dans un nouvel onglet
          window.open(result.pdfUrl, "_blank");
          alert("PDF généré avec succès !");
          // Rafraîchir la liste pour afficher le bouton de téléchargement
          await fetchInvoices();
        } else {
          alert("Erreur: PDF non généré");
        }
      } else {
        alert("Erreur: " + (result.error || "Impossible de générer le PDF"));
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la génération du PDF");
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch("/api/payments/stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const result = await response.json();
      
      if (response.ok && result.url) {
        window.open(result.url, "_blank");
      } else {
        alert("Erreur: " + (result.error || "Impossible de créer la session de paiement"));
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du paiement");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Factures</h1>
      
      {/* Formulaire de création */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 space-y-3">
        <h2 className="text-lg font-semibold mb-3">Créer une nouvelle facture</h2>
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
          <label className="block text-sm font-medium mb-1">Montant (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="100.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Création..." : "Créer la facture"}
        </button>
      </form>

      {/* Liste des factures */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Patient</th>
              <th className="p-2 text-left">Montant</th>
              <th className="p-2 text-left">Statut</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Aucune facture pour le moment
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{inv.patient?.name || "N/A"}</td>
                  <td className="p-2">${inv.amount}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      inv.status === "PAID" ? "bg-green-100 text-green-800" :
                      inv.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-2">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      {inv.pdfUrl ? (
                        <a
                          href={inv.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1 text-sm"
                          title="Télécharger PDF"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </a>
                      ) : (
                        <button
                          onClick={() => handleGeneratePdf(inv.id)}
                          disabled={generatingPdf === inv.id}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                          title="Générer PDF"
                        >
                          {generatingPdf === inv.id ? (
                            <>
                              <FileText className="w-4 h-4 animate-spin" />
                              Génération...
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4" />
                              Générer PDF
                            </>
                          )}
                        </button>
                      )}
                      {inv.status === "PENDING" && (
                        <button
                          onClick={() => handlePayInvoice(inv.id)}
                          className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 flex items-center gap-1 text-sm"
                          title="Payer via Stripe"
                        >
                          <DollarSign className="w-4 h-4" />
                          Payer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


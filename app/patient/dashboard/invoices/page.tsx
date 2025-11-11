"use client";
import { useEffect, useState } from "react";
import { DollarSign, Calendar, Download, CreditCard, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Invoice {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  pdfUrl?: string;
  appointment?: {
    id: string;
    startTime: string;
  };
}

export default function PatientInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      if (res.ok) {
        const data = await res.json();
        // L'API retourne { invoices: [...] }
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des factures:", error);
    } finally {
      setLoading(false);
    }
  };

  const payInvoice = async (id: string) => {
    try {
      const res = await fetch("/api/payments/stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur lors de la création de la session de paiement");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du paiement");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const pendingInvoices = invoices.filter((inv) => inv.status === "PENDING");
  const paidInvoices = invoices.filter((inv) => inv.status === "PAID");
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          href="/patient/dashboard"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-red-600" />
          Mes Factures
        </h1>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Factures</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{pendingInvoices.length}</p>
            <p className="text-sm text-gray-500">${pendingAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payées</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{paidInvoices.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des factures */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      ) : invoices.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Aucune facture pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-red-600" />
                    Facture
                  </CardTitle>
                  <span
                    className={`px-2 py-1 rounded text-xs ${getStatusColor(invoice.status)}`}
                  >
                    {invoice.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Montant</p>
                  <p className="text-2xl font-bold">${invoice.amount.toFixed(2)}</p>
                </div>
                {invoice.appointment && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">Rendez-vous:</p>
                    <p className="text-xs text-gray-600">
                      {formatDate(invoice.appointment.startTime)}
                    </p>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-2">
                    {formatDate(invoice.createdAt)}
                  </p>
                  <div className="flex gap-2">
                    {invoice.status === "PENDING" && (
                      <button
                        onClick={() => payInvoice(invoice.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1 text-sm flex-1 justify-center"
                      >
                        <CreditCard className="w-4 h-4" />
                        Payer
                      </button>
                    )}
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1 text-sm flex-1 justify-center"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

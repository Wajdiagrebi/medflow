"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Invoice {
  id: string;
  amount: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  dueDate: string;
  createdAt: string;
  description?: string;
  appointment?: {
    id: string;
    startTime: string;
  };
}

export default function OnlinePaymentPage() {
  const { showToast } = useToast();
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
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des factures:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (invoiceId: string) => {
    try {
      const res = await fetch("/api/payments/stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast("Erreur lors de la création de la session de paiement", "error");
      }
    } catch (error) {
      showToast("Erreur lors du paiement", "error");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "TND",
    }).format(amount);
  };

  const pendingInvoices = invoices.filter((inv) => inv.status === "PENDING");
  const paidInvoices = invoices.filter((inv) => inv.status === "PAID");
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Paiement en Ligne
            </h1>
            <p className="text-sm text-muted-foreground">
              Gérez et payez vos factures en ligne de manière sécurisée
            </p>
          </div>
        </div>
        <Separator />
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total à Payer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <p className="text-2xl font-bold">{formatAmount(totalPending)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Factures en Attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <p className="text-2xl font-bold">{pendingInvoices.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Factures Payées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-2xl font-bold">{paidInvoices.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Factures en attente */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Factures en Attente de Paiement</h2>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Chargement...
          </div>
        ) : pendingInvoices.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucune facture en attente de paiement
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {invoice.description || "Facture de consultation"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Date d'échéance: {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {formatAmount(invoice.amount)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handlePayment(invoice.id)}
                    className="w-full md:w-auto"
                    variant="default"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payer Maintenant
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Historique des paiements */}
      {paidInvoices.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Historique des Paiements</h2>
          <div className="space-y-2">
            {paidInvoices.map((invoice) => (
              <Card key={invoice.id} className="bg-muted/50">
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {invoice.description || "Facture de consultation"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Payé le {formatDate(invoice.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-lg">
                        {formatAmount(invoice.amount)}
                      </Badge>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


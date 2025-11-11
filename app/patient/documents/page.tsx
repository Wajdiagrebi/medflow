"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Pill, DollarSign, Calendar, Search, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/Toast";

interface Prescription {
  id: string;
  medications?: string;
  instructions?: string;
  pdfUrl?: string;
  createdAt: string;
  doctor: { name: string; email: string };
  consultation: {
    id: string;
    diagnosis: string;
    createdAt: string;
  };
}

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

export default function PatientDocumentsPage() {
  const { showToast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "prescriptions" | "invoices">("all");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      // Récupérer les prescriptions
      const prescriptionsRes = await fetch("/api/prescriptions");
      if (prescriptionsRes.ok) {
        const prescriptionsData = await prescriptionsRes.json();
        setPrescriptions(prescriptionsData || []);
      }

      // Récupérer les factures
      const invoicesRes = await fetch("/api/invoices");
      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData.invoices || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des documents:", error);
      showToast("Erreur lors du chargement des documents", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleDownload = (url: string, filename: string) => {
    if (!url) {
      showToast("Document non disponible", "error");
      return;
    }
    window.open(url, "_blank");
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      prescription.consultation.diagnosis.toLowerCase().includes(term) ||
      prescription.doctor.name.toLowerCase().includes(term) ||
      (prescription.instructions && prescription.instructions.toLowerCase().includes(term))
    );
  });

  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      invoice.id.toLowerCase().includes(term) ||
      invoice.status.toLowerCase().includes(term) ||
      invoice.amount.toString().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          Mes Documents
        </h1>
        <p className="text-gray-600 mt-2">Consultez et téléchargez tous vos documents médicaux</p>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans vos documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setFilterType("all")}>
            Tous les Documents
          </TabsTrigger>
          <TabsTrigger value="prescriptions" onClick={() => setFilterType("prescriptions")}>
            Prescriptions ({prescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="invoices" onClick={() => setFilterType("invoices")}>
            Factures ({invoices.length})
          </TabsTrigger>
        </TabsList>

        {/* Tous les documents */}
        <TabsContent value="all" className="space-y-6">
          {/* Prescriptions */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-green-600" />
              Prescriptions ({filteredPrescriptions.length})
            </h2>
            {filteredPrescriptions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <Pill className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Aucune prescription trouvée</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPrescriptions.map((prescription) => (
                  <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Pill className="w-5 h-5 text-green-600" />
                          Prescription
                        </CardTitle>
                        {prescription.pdfUrl && (
                          <Badge variant="outline" className="bg-green-50">
                            PDF Disponible
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Diagnostic</p>
                        <p className="text-sm">{prescription.consultation.diagnosis}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Docteur</p>
                        <p className="text-sm">{prescription.doctor.name}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(prescription.createdAt)}</span>
                      </div>
                      {prescription.pdfUrl && (
                        <Button
                          onClick={() => handleDownload(prescription.pdfUrl!, `prescription-${prescription.id}.pdf`)}
                          className="w-full mt-2"
                          variant="outline"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger PDF
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Factures */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-600" />
              Factures ({filteredInvoices.length})
            </h2>
            {filteredInvoices.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Aucune facture trouvée</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInvoices.map((invoice) => (
                  <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-red-600" />
                          Facture #{invoice.id.slice(0, 8)}
                        </CardTitle>
                        <Badge
                          variant={
                            invoice.status === "PAID"
                              ? "default"
                              : invoice.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Montant</p>
                        <p className="text-2xl font-bold">{invoice.amount.toFixed(2)} TND</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(invoice.createdAt)}</span>
                      </div>
                      {invoice.pdfUrl && (
                        <Button
                          onClick={() => handleDownload(invoice.pdfUrl!, `facture-${invoice.id}.pdf`)}
                          className="w-full mt-2"
                          variant="outline"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger PDF
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Prescriptions uniquement */}
        <TabsContent value="prescriptions">
          {filteredPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Pill className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Aucune prescription trouvée</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrescriptions.map((prescription) => (
                <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Pill className="w-5 h-5 text-green-600" />
                        Prescription
                      </CardTitle>
                      {prescription.pdfUrl && (
                        <Badge variant="outline" className="bg-green-50">
                          PDF Disponible
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Diagnostic</p>
                      <p className="text-sm">{prescription.consultation.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Docteur</p>
                      <p className="text-sm">{prescription.doctor.name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(prescription.createdAt)}</span>
                    </div>
                    {prescription.pdfUrl && (
                      <Button
                        onClick={() => handleDownload(prescription.pdfUrl!, `prescription-${prescription.id}.pdf`)}
                        className="w-full mt-2"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger PDF
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Factures uniquement */}
        <TabsContent value="invoices">
          {filteredInvoices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Aucune facture trouvée</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-red-600" />
                        Facture #{invoice.id.slice(0, 8)}
                      </CardTitle>
                      <Badge
                        variant={
                          invoice.status === "PAID"
                            ? "default"
                            : invoice.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Montant</p>
                      <p className="text-2xl font-bold">{invoice.amount.toFixed(2)} TND</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(invoice.createdAt)}</span>
                    </div>
                    {invoice.pdfUrl && (
                      <Button
                        onClick={() => handleDownload(invoice.pdfUrl!, `facture-${invoice.id}.pdf`)}
                        className="w-full mt-2"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger PDF
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}


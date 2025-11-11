"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Pricing {
  id: string;
  serviceId: string;
  serviceName: string;
  price: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
}

export default function PricingPage() {
  const { showToast } = useToast();
  const [pricings, setPricings] = useState<Pricing[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    serviceId: "",
    price: "",
    currency: "TND",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pricingsRes, servicesRes] = await Promise.all([
        fetch("/api/admin/pricing"),
        fetch("/api/admin/services"),
      ]);

      if (pricingsRes.ok) {
        const data = await pricingsRes.json();
        setPricings(data.pricings || []);
      }

      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
        }),
      });

      if (res.ok) {
        showToast("Tarif créé avec succès", "success");
        setForm({ serviceId: "", price: "", currency: "TND" });
        fetchData();
      } else {
        showToast("Erreur lors de la création du tarif", "error");
      }
    } catch (error) {
      showToast("Erreur lors de la création du tarif", "error");
    }
  };

  const handleUpdate = async (id: string, price: number) => {
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, price }),
      });

      if (res.ok) {
        showToast("Tarif modifié avec succès", "success");
        setEditingId(null);
        fetchData();
      } else {
        showToast("Erreur lors de la modification", "error");
      }
    } catch (error) {
      showToast("Erreur lors de la modification", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce tarif ?")) return;

    try {
      const res = await fetch("/api/admin/pricing", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        showToast("Tarif supprimé avec succès", "success");
        fetchData();
      } else {
        showToast("Erreur lors de la suppression", "error");
      }
    } catch (error) {
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestion des Tarifs
            </h1>
            <p className="text-sm text-muted-foreground">
              Gérez les tarifs de vos services médicaux
            </p>
          </div>
        </div>
        <Separator />
      </div>

      {/* Formulaire de création */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter un Tarif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Service</label>
                <select
                  value={form.serviceId}
                  onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border bg-background"
                  required
                >
                  <option value="">Sélectionner un service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prix</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Devise</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border bg-background"
                >
                  <option value="TND">TND (Dinar tunisien)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="USD">USD (Dollar)</option>
                </select>
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le Tarif
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Liste des tarifs */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Tarifs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : pricings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun tarif configuré
            </div>
          ) : (
            <div className="space-y-4">
              {pricings.map((pricing) => (
                <Card key={pricing.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{pricing.serviceName}</h3>
                          {pricing.isActive ? (
                            <Badge variant="default">Actif</Badge>
                          ) : (
                            <Badge variant="secondary">Inactif</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Créé le {new Date(pricing.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {editingId === pricing.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              defaultValue={pricing.price}
                              className="w-24"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const newPrice = parseFloat(e.currentTarget.value);
                                  handleUpdate(pricing.id, newPrice);
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                const input = document.querySelector(
                                  `input[defaultValue="${pricing.price}"]`
                                ) as HTMLInputElement;
                                if (input) {
                                  handleUpdate(pricing.id, parseFloat(input.value));
                                }
                              }}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <p className="text-xl font-bold">
                              {formatPrice(pricing.price, pricing.currency)}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(pricing.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(pricing.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


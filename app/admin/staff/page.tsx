"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Trash2, Mail, Phone, Briefcase } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function StaffPage() {
  const { showToast } = useToast();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "DOCTOR",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/admin/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingStaff ? "PUT" : "POST";
      const res = await fetch("/api/admin/staff", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingStaff
            ? { ...form, id: editingStaff.id }
            : form
        ),
      });

      if (res.ok) {
        showToast(
          editingStaff
            ? "Membre du staff modifié avec succès"
            : "Membre du staff créé avec succès",
          "success"
        );
        setForm({ name: "", email: "", role: "DOCTOR" });
        setEditingStaff(null);
        setDialogOpen(false);
        fetchStaff();
      } else {
        showToast("Erreur lors de la sauvegarde", "error");
      }
    } catch (error) {
      showToast("Erreur lors de la sauvegarde", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre du staff ?")) return;

    try {
      const res = await fetch("/api/admin/staff", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        showToast("Membre du staff supprimé avec succès", "success");
        fetchStaff();
      } else {
        showToast("Erreur lors de la suppression", "error");
      }
    } catch (error) {
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setForm({
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
    });
    setDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="destructive">Administrateur</Badge>;
      case "DOCTOR":
        return <Badge variant="default">Médecin</Badge>;
      case "RECEPTIONIST":
        return <Badge variant="secondary">Réceptionniste</Badge>;
      case "PATIENT":
        return <Badge variant="outline" className="bg-blue-50">Patient</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestion du Staff
            </h1>
            <p className="text-sm text-muted-foreground">
              Gérez les membres de votre équipe médicale
            </p>
          </div>
        </div>
        <Separator />
      </div>

      {/* Bouton d'ajout */}
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingStaff(null);
                setForm({ name: "", email: "", role: "DOCTOR" });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Membre
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingStaff ? "Modifier le Membre" : "Nouveau Membre du Staff"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom complet *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nom complet"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rôle *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border bg-background"
                  required
                >
                  <option value="DOCTOR">Médecin</option>
                  <option value="RECEPTIONIST">Réceptionniste</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="PATIENT">Patient</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingStaff(null);
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  {editingStaff ? "Modifier" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste du staff */}
      <Card>
        <CardHeader>
          <CardTitle>Liste du Staff</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun membre du staff
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.map((member) => (
                <Card key={member.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      {getRoleBadge(member.role)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {member.email}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(member)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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


"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/Toast";
import {
  Edit,
  Trash2,
  Search,
  Plus,
  Users,
  Mail,
  Calendar,
  FileText,
} from "lucide-react";
import type { Patient } from "@/types/patient";
import { PatientForm } from "./PatientForm";

interface PatientListProps {
  apiPath: string;
}

export function PatientList({ apiPath }: PatientListProps) {
  const { showToast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiPath);
      const json = await res.json();
      setPatients(json.patients || []);
    } catch (err) {
      showToast("Impossible de charger les patients.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [apiPath]);

  const handleDelete = async (id: string | number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) return;

    try {
      const res = await fetch(apiPath, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        showToast("Patient supprimé avec succès", "success");
        fetchPatients();
      } else {
        showToast("Erreur lors de la suppression", "error");
      }
    } catch (err) {
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setEditDialogOpen(true);
  };

  const filtered = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.condition?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPatients = patients.length;
  const filteredCount = filtered.length;

  return (
    <div className="space-y-6">
      {/* Statistiques et Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{totalPatients}</p>
            </div>
          </div>
          {search && (
            <Badge variant="secondary" className="text-sm">
              {filteredCount} résultat{filteredCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <Popover open={dialogOpen} onOpenChange={setDialogOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="default" 
              size="default"
              className="shadow-sm hover:shadow-md transition-all"
              aria-label="Ajouter un nouveau patient"
            >
              <Plus className="h-4 w-4" />
              Nouveau Patient
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[500px] p-0 bg-background z-[100]" 
            align="start"
            side="bottom"
            sideOffset={8}
            style={{ zIndex: 100 }}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Plus className="h-5 w-5 text-foreground" />
                <h3 className="text-lg font-semibold text-foreground">Nouveau Patient</h3>
              </div>
              <PatientForm
                apiPath={apiPath}
                onSuccess={() => {
                  fetchPatients();
                  setDialogOpen(false);
                }}
                onCancel={() => {
                  setDialogOpen(false);
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Barre de recherche améliorée */}
      <div className={`relative transition-all duration-300 ease-in-out ${dialogOpen ? 'mt-[450px]' : 'mt-0'}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, email, condition..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 shadow-sm focus:shadow-md transition-shadow"
        />
      </div>

      <Separator />

      {/* Liste des patients */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-muted p-6">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {search
                  ? "Aucun patient trouvé"
                  : "Aucun patient enregistré"}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {search
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par ajouter votre premier patient"}
              </p>
            </div>
            {!search && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="default" 
                    size="default"
                    className="shadow-sm hover:shadow-md transition-all"
                    aria-label="Ajouter un nouveau patient"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un patient
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Nouveau Patient</DialogTitle>
                  </DialogHeader>
                  <PatientForm
                    apiPath={apiPath}
                    onSuccess={() => {
                      fetchPatients();
                      setDialogOpen(false);
                    }}
                    onCancel={() => {
                      setDialogOpen(false);
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((patient) => (
            <Card
              key={patient.id}
              className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {patient.name}
                  </CardTitle>
                  <div className="flex gap-1 shrink-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(patient)}
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Modifier</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(patient.id)}
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Supprimer</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Email
                    </p>
                    <p className="text-sm font-medium truncate">
                      {patient.email || (
                        <span className="text-muted-foreground italic">
                          Non renseigné
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Âge</p>
                    <p className="text-sm font-medium">
                      {patient.age} ans
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Condition
                    </p>
                    {patient.condition ? (
                      <Badge
                        variant="outline"
                        className="text-xs font-normal w-fit"
                      >
                        {patient.condition}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-xs font-normal w-fit"
                      >
                        Aucune condition
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog d'édition */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Modifier le Patient
            </DialogTitle>
          </DialogHeader>
          {editingPatient && (
            <PatientForm
              apiPath={apiPath}
              editing={editingPatient}
              onSuccess={() => {
                fetchPatients();
                setEditDialogOpen(false);
                setEditingPatient(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


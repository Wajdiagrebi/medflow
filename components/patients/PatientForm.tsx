"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/Toast";
import { User, Mail, Calendar, FileText, Loader2 } from "lucide-react";
import type { Patient } from "@/types/patient";

interface PatientFormProps {
  apiPath: string;
  editing?: Patient;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function PatientForm({
  apiPath,
  editing,
  onSuccess,
  onCancel,
}: PatientFormProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: editing?.name || "",
    email: editing?.email || "",
    age: editing?.age?.toString() || "",
    condition: editing?.condition || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing
        ? { ...form, id: editing.id, age: Number(form.age) }
        : { ...form, age: Number(form.age) };

      const res = await fetch(apiPath, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur en sauvegardant");
      }

      showToast(
        editing ? "Patient modifié avec succès" : "Patient créé avec succès",
        "success"
      );
      onSuccess();
      
      // Réinitialiser le formulaire si création
      if (!editing) {
        setForm({ name: "", email: "", age: "", condition: "" });
      }
    } catch (err: any) {
      showToast(err.message || "Erreur lors de la sauvegarde", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <User className="h-4 w-4 text-foreground" />
            Nom <span className="text-destructive">*</span>
          </label>
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nom complet du patient"
            className="h-10"
            disabled={isSubmitting}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <Mail className="h-4 w-4 text-foreground" />
            Email <span className="text-destructive">*</span>
          </label>
          <Input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="email@example.com"
            className="h-10"
            disabled={isSubmitting}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <Calendar className="h-4 w-4 text-foreground" />
            Âge <span className="text-destructive">*</span>
          </label>
          <Input
            required
            type="number"
            min={0}
            max={150}
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            placeholder="Âge en années"
            className="h-10"
            disabled={isSubmitting}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <FileText className="h-4 w-4 text-foreground" />
            Condition médicale
          </label>
          <Input
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            placeholder="Condition médicale (optionnel)"
            className="h-10"
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            Informations médicales pertinentes (optionnel)
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => {
            if (!editing) {
              setForm({ name: "", email: "", age: "", condition: "" });
            }
            if (onCancel) {
              onCancel();
            }
          }}
          className="min-w-[100px]"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="default"
          disabled={isSubmitting}
          className="min-w-[100px] shadow-md hover:shadow-lg transition-shadow"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {editing ? "Modification..." : "Création..."}
            </>
          ) : (
            <>{editing ? "Modifier" : "Créer"}</>
          )}
        </Button>
      </div>
    </form>
  );
}


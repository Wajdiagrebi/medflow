"use client";

import { Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PatientList } from "@/components/patients/PatientList";

export default function AdminPatientsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestion des Patients
            </h1>
            <p className="text-sm text-muted-foreground">
              Gérez les informations de vos patients
            </p>
          </div>
        </div>
        <Separator />
      </div>
      <PatientList apiPath="/api/admin/patients" />
    </div>
  );
}


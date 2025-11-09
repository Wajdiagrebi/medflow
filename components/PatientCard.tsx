// components/PatientCard.tsx
"use client";

import { Patient } from "@/types/patient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
  CardAction,
} from "@/components/ui/card";

interface PatientCardProps {
  patient: Patient;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
}

export default function PatientCard({
  patient,
  onEdit,
  onDelete,
}: PatientCardProps) {

  // Couleur du badge selon la pathologie
  const badgeColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "allergie": return "bg-red-500";
      case "diabète": return "bg-yellow-500";
      case "grippe": return "bg-green-500";
      default: return "bg-blue-500";
    }
  }

  return (
    <Card className="w-80 bg-white dark:bg-zinc-900 text-black dark:text-white transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">{patient.name}</CardTitle>
        <CardAction className="flex gap-2">
          <button
            onClick={() => onEdit?.(patient)}
            className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            ✏️ Modifier
          </button>
          <button
            onClick={() => onDelete?.(patient)}
            className="text-sm px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            🗑️ Supprimer
          </button>
        </CardAction>
        <CardDescription>
          <span className={`text-white px-2 py-1 rounded ${badgeColor(patient.condition)}`}>
            {patient.condition}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p><strong>Email:</strong> {patient.email}</p>
        <p><strong>Âge:</strong> {patient.age}</p>
      </CardContent>

      <CardFooter className="justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>ID: {patient.id}</span>
        <span>Dernière visite: 01/11/2025</span>
      </CardFooter>
    </Card>
  );
}

import { Patient } from "@/types/patient";
import PatientCard from "./PatientCard";

interface PatientListProps {
  patients: Patient[];
}

export default function PatientList({ patients }: PatientListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {patients.map((p, i) => (
        <PatientCard key={p.id ?? i} patient={p} />
      ))}
    </div>
  );
}

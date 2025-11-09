import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email({ message: "Email invalide" }),
  age: z.number().int().min(0),
  condition: z.string().optional().default("N/A"),
});

export type PatientInput = z.infer<typeof patientSchema>;

export const consultationSchema = z.object({
  doctorId: z.string().min(1, "L'ID du docteur est requis"),
  patientId: z.string().min(1, "L'ID du patient est requis"),
  appointmentId: z.string().optional().or(z.literal("").transform(() => undefined)),
  diagnosis: z.string().min(3, "Le diagnostic doit contenir au moins 3 caractères"),
  notes: z.string().optional().or(z.literal("").transform(() => undefined)),
});

export type ConsultationInput = z.infer<typeof consultationSchema>;

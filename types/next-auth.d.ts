import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "PATIENT";
      clinicId: string; // ✅ ajouté pour éviter les erreurs TypeScript
      email?: string | null;
      name?: string | null;
    };
  }

  interface JWT {
    id?: string;
    role: "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "PATIENT";
    clinicId: string;
  }
}

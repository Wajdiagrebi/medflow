"use client";

import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoginComponent from "@/components/Login";

// Composant interne qui vérifie la session
// Note: Le middleware redirige déjà /login → dashboard si authentifié
// Cette redirection côté client est un fallback au cas où le middleware ne le ferait pas
function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, rediriger vers son dashboard
    // Utiliser replace au lieu de push pour éviter les boucles
    if (status === "authenticated" && session) {
      const role = session.user.role;
      let redirectUrl = "/admin/dashboard";
      
      switch (role) {
        case "ADMIN":
          redirectUrl = "/admin/dashboard";
          break;
        case "DOCTOR":
          redirectUrl = "/doctor/consultations";
          break;
        case "RECEPTIONIST":
          redirectUrl = "/reception/dashboard";
          break;
        case "PATIENT":
          redirectUrl = "/patient/dashboard";
          break;
        default:
          redirectUrl = "/admin/dashboard";
      }
      
      // Utiliser replace pour éviter d'ajouter à l'historique
      router.replace(redirectUrl);
    }
  }, [session, status, router]);

  // Afficher un loader pendant la vérification
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est déjà connecté, ne rien afficher (la redirection est en cours)
  if (status === "authenticated") {
    return null;
  }

  return <LoginComponent />;
}

export default function LoginPage() {
  return (
    <SessionProvider>
      <LoginContent />
    </SessionProvider>
  );
}

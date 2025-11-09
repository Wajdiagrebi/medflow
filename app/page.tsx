"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SessionProvider } from "next-auth/react";

function HomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Si l'utilisateur est connecté, rediriger vers son dashboard
    if (status === "authenticated" && session) {
      const role = session.user.role;
      switch (role) {
        case "ADMIN":
          router.push("/admin/dashboard");
          break;
        case "DOCTOR":
          router.push("/doctor/consultations");
          break;
        case "RECEPTIONIST":
          router.push("/reception/dashboard");
          break;
        case "PATIENT":
          router.push("/patient/dashboard");
          break;
        default:
          router.push("/login");
      }
    } else if (status === "unauthenticated") {
      // Si l'utilisateur n'est pas connecté, rediriger vers login
      router.push("/login");
    }
  }, [session, status, router]);

  // Afficher un loader pendant la vérification
  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </main>
    );
  }

  // Ne rien afficher pendant la redirection
  return null;
}

export default function Home() {
  return (
    <SessionProvider>
      <HomeContent />
    </SessionProvider>
  );
}

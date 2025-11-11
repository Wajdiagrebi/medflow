"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
// Navbar et Breadcrumbs supprimés - le dashboard utilise son propre Header et Sidebar
// import Navbar from "@/components/navigation/Navbar";
// import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import { createContext, useContext, ReactNode, useEffect } from "react";

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within AuthenticatedLayout");
  }
  return context;
}

// Composant interne qui vérifie l'authentification
function AuthenticatedContent({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Si la session est chargée et qu'il n'y a pas de session, rediriger vers login
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Afficher un loader pendant le chargement
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

  // Si pas de session, ne rien afficher (la redirection est en cours)
  if (!session) {
    return null;
  }

  return <>{children}</>;
}

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { showToast, removeToast, toasts } = useToast();

  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      showToast(event.detail.message, event.detail.type);
    };

    window.addEventListener("show-toast" as any, handleToast as EventListener);
    return () => {
      window.removeEventListener("show-toast" as any, handleToast as EventListener);
    };
  }, [showToast]);

  return (
    <SessionProvider>
      <ToastContext.Provider value={{ showToast }}>
        <AuthenticatedContent>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navbar et Breadcrumbs supprimés - le dashboard utilise son propre Header et Sidebar */}
            <main className="max-w-7xl mx-auto">{children}</main>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
          </div>
        </AuthenticatedContent>
      </ToastContext.Provider>
    </SessionProvider>
  );
}


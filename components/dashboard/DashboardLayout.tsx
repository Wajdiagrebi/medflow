"use client";

import React, { useState, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import DashboardContent from "./DashboardContent";
import "@/styles/dashboard.css";

// Composant interne qui vérifie l'authentification
function AuthenticatedDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);

  useEffect(() => {
    // Si la session est chargée et qu'il n'y a pas de session, rediriger vers login
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  // Afficher un loader pendant le chargement
  if (status === "loading") {
    return (
      <div className="grid-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas de session, ne rien afficher (la redirection est en cours)
  if (!session) {
    return null;
  }

  return (
    <div className="grid-container">
      <Header OpenSidebar={OpenSidebar} />
      <Sidebar
        openSidebarToggle={openSidebarToggle}
        OpenSidebar={OpenSidebar}
      />
      <DashboardContent />
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <SessionProvider>
      <AuthenticatedDashboard />
    </SessionProvider>
  );
}


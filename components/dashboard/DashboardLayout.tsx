"use client";

import React, { useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import DashboardContent from "./DashboardContent";
import "@/styles/dashboard.css";

// Composant interne qui vérifie l'authentification
// Note: L'authentification est déjà gérée par le middleware, donc on ne redirige pas ici
function AuthenticatedDashboard() {
  const { data: session, status } = useSession();
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  // Afficher un loader pendant le chargement de la session
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

  // Si pas de session, afficher quand même le dashboard (le middleware gère l'authentification)
  // Cela évite les boucles de redirection entre le middleware et le client

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


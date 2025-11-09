import { ReactNode } from "react";

// Layout spécifique pour le dashboard admin avec le nouveau design
// On ne passe pas par AuthenticatedLayout car le nouveau dashboard a son propre Header et Sidebar
export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}


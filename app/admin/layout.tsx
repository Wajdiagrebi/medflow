import AuthenticatedLayout from "@/components/layouts/AuthenticatedLayout";

// Layout pour toutes les routes admin qui ne sont pas dans le groupe (dashboard)
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}


"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  if (!pathname || pathname === "/") return null;

  const pathSegments = pathname.split("/").filter(Boolean);

  const getLabel = (segment: string, index: number, segments: string[]): string => {
    // Labels personnalisés pour certains segments
    const labels: Record<string, string> = {
      admin: "Administration",
      doctor: "Médecin",
      patient: "Patient",
      reception: "Réception",
      dashboard: "Tableau de bord",
      appointments: "Rendez-vous",
      consultations: "Consultations",
      prescriptions: "Prescriptions",
      invoices: "Factures",
      new: "Nouveau",
      services: "Services",
    };

    // Si c'est un ID (UUID ou CUID), afficher "Détails"
    if (segment.length > 20 || /^[a-z0-9]+$/.test(segment)) {
      return "Détails";
    }

    return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Accueil", href: "/" },
    ...pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      const isLast = index === pathSegments.length - 1;
      return {
        label: getLabel(segment, index, pathSegments),
        href: isLast ? undefined : href,
      };
    }),
  ];

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4 px-4 sm:px-6 lg:px-8 py-2 bg-gray-50 dark:bg-gray-900/50">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index === 0 ? (
            <Link
              href={item.href || "/"}
              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {item.label}
                </span>
              )}
            </>
          )}
        </div>
      ))}
    </nav>
  );
}


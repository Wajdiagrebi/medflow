"use client";

import React from "react";
import {
  BsGrid1X2Fill,
  BsPeopleFill,
  BsCalendar3,
  BsFileText,
  BsCashStack,
  BsFileEarmarkMedical,
  BsPrescription2,
  BsX,
  BsCreditCard,
} from "react-icons/bs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

interface SidebarProps {
  openSidebarToggle: boolean;
  OpenSidebar: () => void;
}

export default function Sidebar({ openSidebarToggle, OpenSidebar }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const role = session.user.role;

  // Définition des liens selon le rôle
  const getLinks = () => {
    switch (role) {
      case "ADMIN":
        return [
          { href: "/admin/dashboard", label: "Dashboard", icon: BsGrid1X2Fill },
          { href: "/admin/patients", label: "Patients", icon: BsPeopleFill },
          { href: "/admin/appointments", label: "Rendez-vous", icon: BsCalendar3 },
          { href: "/admin/invoices", label: "Factures", icon: BsCashStack },
          { href: "/admin/dashboard/services", label: "Services", icon: BsFileText },
          { href: "/admin/pricing", label: "Tarifs", icon: BsCashStack },
          { href: "/admin/staff", label: "Staff", icon: BsPeopleFill },
        ];
      case "DOCTOR":
        return [
          { href: "/doctor/consultations", label: "Consultations", icon: BsFileEarmarkMedical },
          { href: "/doctor/prescriptions", label: "Prescriptions", icon: BsPrescription2 },
        ];
      case "RECEPTIONIST":
        return [
          { href: "/reception/dashboard", label: "Dashboard", icon: BsGrid1X2Fill },
          { href: "/reception/appointments", label: "Rendez-vous", icon: BsCalendar3 },
          { href: "/admin/invoices", label: "Factures", icon: BsCashStack },
        ];
      case "PATIENT":
        return [
          { href: "/patient/appointments", label: "Mes Rendez-vous", icon: BsCalendar3 },
          { href: "/patient/consultations", label: "Mes Consultations", icon: BsFileEarmarkMedical },
          { href: "/patient/prescriptions", label: "Mes Prescriptions", icon: BsPrescription2 },
          { href: "/patient/documents", label: "Mes Documents", icon: BsFileText },
          { href: "/patient/payment-online", label: "Paiement en Ligne", icon: BsCreditCard },
          { href: "/patient/dashboard/invoices", label: "Mes Factures", icon: BsCashStack },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();
  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <aside
      id="sidebar"
      className={openSidebarToggle ? "sidebar-responsive" : ""}
    >
      <div className="sidebar-title">
        <div className="sidebar-brand">
          <BsGrid1X2Fill className="icon_header" /> Clinique Tekup
        </div>
        <span className="icon close_icon" onClick={OpenSidebar}>
          <BsX />
        </span>
      </div>
      <ul className="sidebar-list">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li
              key={link.href}
              className={`sidebar-list-item ${isActive(link.href) ? "active" : ""}`}
            >
              <Link href={link.href} onClick={OpenSidebar}>
                <Icon className="icon" /> {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}


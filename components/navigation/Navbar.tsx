"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Pill,
  DollarSign,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!session) return null;

  const role = session.user.role;
  const isActive = (path: string) => pathname?.startsWith(path);

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/patients", label: "Patients", icon: Users },
    { href: "/admin/appointments", label: "Rendez-vous", icon: Calendar },
    { href: "/admin/invoices", label: "Factures", icon: DollarSign },
    { href: "/admin/dashboard/services", label: "Services", icon: FileText },
  ];

  const doctorLinks = [
    { href: "/doctor/consultations", label: "Consultations", icon: FileText },
    { href: "/doctor/prescriptions", label: "Prescriptions", icon: Pill },
  ];

  const receptionistLinks = [
    { href: "/reception/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/reception/appointments", label: "Rendez-vous", icon: Calendar },
    { href: "/admin/invoices", label: "Factures", icon: DollarSign },
  ];

  const patientLinks = [
    { href: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patient/appointments", label: "Mes Rendez-vous", icon: Calendar },
    { href: "/patient/consultations", label: "Mes Consultations", icon: FileText },
    { href: "/patient/prescriptions", label: "Mes Prescriptions", icon: Pill },
    { href: "/patient/dashboard/invoices", label: "Mes Factures", icon: DollarSign },
  ];

  const getLinks = () => {
    switch (role) {
      case "ADMIN":
        return adminLinks;
      case "DOCTOR":
        return doctorLinks;
      case "RECEPTIONIST":
        return receptionistLinks;
      case "PATIENT":
        return patientLinks;
      default:
        return [];
    }
  };

  const links = getLinks();

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => (
    <Link
      href={href}
      onClick={() => setMobileMenuOpen(false)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isActive(href)
          ? "bg-blue-600 text-white"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">MedFlow</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {links.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <User className="w-4 h-4" />
              <span>{session.user.email}</span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                {role}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    <span>{session.user.email}</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                    {role}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


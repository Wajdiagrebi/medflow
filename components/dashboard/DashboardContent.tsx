"use client";

import React from "react";
import {
  BsPeopleFill,
  BsCalendar3,
  BsCashStack,
  BsFileEarmarkMedical,
  BsFillBellFill,
} from "react-icons/bs";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import useSWR from "swr";
import { useSession } from "next-auth/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardContent() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  // Récupérer les données selon le rôle
  const apiUrl =
    role === "ADMIN"
      ? "/api/admin/dashboard"
      : role === "RECEPTIONIST"
      ? "/api/admin/dashboard"
      : role === "PATIENT"
      ? "/api/patient/dashboard"
      : null;

  const { data, error, isLoading } = useSWR(apiUrl, fetcher);

  // Préparer les données pour les graphiques (exemple - à adapter avec les vraies données)
  // Pour l'instant, on utilise des données de démonstration
  // TODO: Récupérer les vraies données depuis l'API
  const chartData = [
    { name: "Lun", rendezvous: 12, consultations: 8 },
    { name: "Mar", rendezvous: 15, consultations: 10 },
    { name: "Mer", rendezvous: 10, consultations: 7 },
    { name: "Jeu", rendezvous: 18, consultations: 12 },
    { name: "Ven", rendezvous: 14, consultations: 9 },
    { name: "Sam", rendezvous: 8, consultations: 5 },
    { name: "Dim", rendezvous: 5, consultations: 3 },
  ];

  if (isLoading) {
    return (
      <main className="main-container">
        <div className="main-title">
          <h3>DASHBOARD</h3>
        </div>
        <p>Chargement...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-container">
        <div className="main-title">
          <h3>DASHBOARD</h3>
        </div>
        <p>Erreur lors du chargement des données</p>
      </main>
    );
  }

  // Statistiques selon le rôle
  const getStats = () => {
    if (!data) return [];

    if (role === "ADMIN" || role === "RECEPTIONIST") {
      return [
        {
          title: "PATIENTS",
          value: data.patients || 0,
          icon: BsPeopleFill,
          color: "#2962ff",
        },
        {
          title: "RENDEZ-VOUS",
          value: data.appointmentsToday || 0,
          icon: BsCalendar3,
          color: "#ff6d00",
        },
        {
          title: "RECETTES",
          value: `€ ${(data.revenue || 0).toLocaleString("fr-FR")}`,
          icon: BsCashStack,
          color: "#2e7d32",
        },
        {
          title: "CONSULTATIONS",
          value: data.consultationsCount || 0,
          icon: BsFileEarmarkMedical,
          color: "#d50000",
        },
      ];
    } else if (role === "PATIENT") {
      return [
        {
          title: "MES RENDEZ-VOUS",
          value: data.upcomingAppointments || 0,
          icon: BsCalendar3,
          color: "#2962ff",
        },
        {
          title: "MES CONSULTATIONS",
          value: data.consultations || 0,
          icon: BsFileEarmarkMedical,
          color: "#ff6d00",
        },
        {
          title: "MES FACTURES",
          value: data.pendingInvoices || 0,
          icon: BsCashStack,
          color: "#2e7d32",
        },
        {
          title: "ALERTES",
          value: data.alerts || 0,
          icon: BsFillBellFill,
          color: "#d50000",
        },
      ];
    }
    return [];
  };

  const stats = getStats();

  return (
    <main className="main-container">
      <div className="main-title">
        <h3>DASHBOARD</h3>
      </div>
      <div className="main-cards">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="card"
              style={{ backgroundColor: stat.color }}
            >
              <div className="card-inner">
                <h3>{stat.title}</h3>
                <Icon className="card_icon" />
              </div>
              <h1>{stat.value}</h1>
            </div>
          );
        })}
      </div>
      <div className="charts">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="rendezvous" fill="#8884d8" />
            <Bar dataKey="consultations" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="rendezvous"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
            <Line type="monotone" dataKey="consultations" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}


"use client";

import React from "react";
import {
  BsPeopleFill,
  BsCalendar3,
  BsCashStack,
  BsFileEarmarkMedical,
  BsFillBellFill,
  BsPrescription2,
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

  // Préparer les données pour les graphiques depuis l'API
  // Si les données ne sont pas disponibles, utiliser des données par défaut
  const chartData = data?.chartData || [
    { name: "Lun", rendezvous: 0, consultations: 0 },
    { name: "Mar", rendezvous: 0, consultations: 0 },
    { name: "Mer", rendezvous: 0, consultations: 0 },
    { name: "Jeu", rendezvous: 0, consultations: 0 },
    { name: "Ven", rendezvous: 0, consultations: 0 },
    { name: "Sam", rendezvous: 0, consultations: 0 },
    { name: "Dim", rendezvous: 0, consultations: 0 },
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
          title: "MES PRESCRIPTIONS",
          value: data.prescriptions || 0,
          icon: BsPrescription2,
          color: "#ffa726",
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
        <div className="chart-container">
          <h4 style={{ color: '#fff', marginBottom: '15px', fontSize: '16px', fontWeight: 600 }}>
            Rendez-vous et Consultations (Semaine)
          </h4>
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" stroke="#9e9ea4" />
              <YAxis stroke="#9e9ea4" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#263043', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Legend wrapperStyle={{ color: '#9e9ea4' }} />
              <Bar dataKey="rendezvous" fill="#667eea" radius={[8, 8, 0, 0]} />
              <Bar dataKey="consultations" fill="#4facfe" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <h4 style={{ color: '#fff', marginBottom: '15px', fontSize: '16px', fontWeight: 600 }}>
            Tendances (Semaine)
          </h4>
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" stroke="#9e9ea4" />
              <YAxis stroke="#9e9ea4" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#263043', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Legend wrapperStyle={{ color: '#9e9ea4' }} />
              <Line
                type="monotone"
                dataKey="rendezvous"
                stroke="#667eea"
                strokeWidth={3}
                activeDot={{ r: 8, fill: '#667eea' }}
                dot={{ r: 4, fill: '#667eea' }}
              />
              <Line 
                type="monotone" 
                dataKey="consultations" 
                stroke="#4facfe" 
                strokeWidth={3}
                activeDot={{ r: 8, fill: '#4facfe' }}
                dot={{ r: 4, fill: '#4facfe' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}


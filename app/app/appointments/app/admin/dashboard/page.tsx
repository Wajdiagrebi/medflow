"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    patients: 0,
    appointmentsToday: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <main className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle>Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.patients}</p>
        </CardContent>
      </Card>

      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle>Rendez-vous du jour</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.appointmentsToday}</p>
        </CardContent>
      </Card>

      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle>Recettes (demo)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.revenue} €</p>
        </CardContent>
      </Card>
    </main>
  );
}

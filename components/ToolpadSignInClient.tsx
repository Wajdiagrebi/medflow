"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Fallback simple sign-in UI used when @toolpad is not installed.
export default function ToolpadSignInClient() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Connexion (formulaire simplifié)</h2>
      <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="text-sm mb-1 block">Email</label>
          <Input type="email" placeholder="votre@email.com" />
        </div>
        <div>
          <label className="text-sm mb-1 block">Mot de passe</label>
          <Input type="password" placeholder="••••••••" />
        </div>
        <Button type="submit" className="w-full">Se connecter</Button>
      </form>
    </div>
  );
}

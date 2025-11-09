"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Login from "@react-login-page/page9";
import LoginBg from "@react-login-page/page9/bg.jpg";
import "./Login.css";

export default function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation simple
    if (!email.trim() || !password) {
      setError("Remplis l'email et le mot de passe.");
      setLoading(false);
      return;
    }

    // Vérification du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email invalide.");
      setLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Email ou mot de passe incorrect.");
      } else if (res?.ok) {
        // Redirection basée sur le rôle
        // On attend un peu pour que la session soit mise à jour
        setTimeout(() => {
          // On redirige vers admin par défaut, le middleware gérera la redirection selon le rôle
          router.push("/admin/dashboard");
          router.refresh();
        }, 100);
      }
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  // Utiliser le composant @react-login-page/page9 comme wrapper visuel avec arrière-plan
  // Le formulaire est placé par-dessus avec notre propre style
  return (
    <div className="login-wrapper">
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "580px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Composant @react-login-page/page9 comme arrière-plan */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Login
            style={{
              height: "100%",
              width: "100%",
              backgroundImage: `url(${LoginBg})`,
            }}
          />
        </div>
        {/* Formulaire personnalisé par-dessus */}
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Connexion</h2>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            placeholder="votre@email.com"
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}


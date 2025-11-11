"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Login from "@react-login-page/page9";
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

    if (!email.trim() || !password) {
      setError("Remplis l'email et le mot de passe.");
      setLoading(false);
      return;
    }

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
        setTimeout(() => {
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
        {/* ✅ Utilisation de ton image locale comme fond */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Login
            style={{
              height: "100%",
              width: "100%",
              backgroundImage: `url("/cl.jpg")`, // <-- ton image ici
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>

        {/* ✅ Formulaire de connexion */}
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

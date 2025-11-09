// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Mapping des routes et rôles requis
const routeRoles: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/doctor": ["DOCTOR"],
  "/reception": ["RECEPTIONIST", "ADMIN"],
  "/patient": ["PATIENT"],
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Si l'utilisateur est sur la page de login et déjà authentifié, rediriger vers le dashboard approprié
    if (pathname === "/login" && token) {
      const role = token.role as string;
      let redirectUrl = "/dashboard"; // Page par défaut qui redirigera selon le rôle
      
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Vérifier les permissions des routes protégées
    const routeMatch = Object.entries(routeRoles).find(([route]) =>
      pathname.startsWith(route)
    );

    if (routeMatch) {
      const [route, allowedRoles] = routeMatch;
      const role = token?.role as string | undefined;
      
      if (!role || !allowedRoles.includes(role)) {
        // Rediriger vers /login avec un message d'erreur
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Routes publiques - toujours autorisées
        const publicRoutes = [
          "/login",
          "/onboarding", 
          "/api/auth",
          "/_next",
          "/favicon.ico",
          "/"
        ];
        
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }
        
        // Pour toutes les autres routes, l'utilisateur doit être connecté
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
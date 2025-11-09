"use client";

// Helper pour afficher des toasts depuis n'importe où dans l'application
// Utilisez cette fonction pour afficher des messages de succès/erreur

export const showSuccessToast = (message: string) => {
  // Cette fonction sera remplacée par le contexte Toast
  if (typeof window !== "undefined") {
    const event = new CustomEvent("show-toast", {
      detail: { message, type: "success" },
    });
    window.dispatchEvent(event);
  }
};

export const showErrorToast = (message: string) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("show-toast", {
      detail: { message, type: "error" },
    });
    window.dispatchEvent(event);
  }
};

export const showWarningToast = (message: string) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("show-toast", {
      detail: { message, type: "warning" },
    });
    window.dispatchEvent(event);
  }
};

export const showInfoToast = (message: string) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("show-toast", {
      detail: { message, type: "info" },
    });
    window.dispatchEvent(event);
  }
};


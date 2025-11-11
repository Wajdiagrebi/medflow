"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BsFillBellFill,
  BsFillEnvelopeFill,
  BsPersonCircle,
  BsSearch,
  BsJustify,
  BsPeopleFill,
  BsCalendar3,
  BsFileEarmarkMedical,
  BsCashStack,
  BsFileText,
} from "react-icons/bs";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

interface HeaderProps {
  OpenSidebar: () => void;
}

interface SearchResult {
  id: string;
  type: "patient" | "appointment" | "consultation" | "invoice" | "service";
  url: string;
  [key: string]: any;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  url: string;
  read: boolean;
  createdAt: string;
}

interface Message {
  id: string;
  type: string;
  title: string;
  message: string;
  sender: string;
  icon: string;
  url: string;
  read: boolean;
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Header({ OpenSidebar }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Recherche avec debounce
  const { data: searchResults, isLoading: isSearching } = useSWR<{
    patients: SearchResult[];
    appointments: SearchResult[];
    consultations: SearchResult[];
    invoices: SearchResult[];
    services: SearchResult[];
  }>(
    searchQuery.length >= 2 ? `/api/search?q=${encodeURIComponent(searchQuery)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 500,
    }
  );

  // Notifications
  const { data: notificationsData, mutate: mutateNotifications } = useSWR<{
    notifications: Notification[];
    unreadCount: number;
  }>("/api/notifications", fetcher, {
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  // Clé unique par utilisateur pour les notifications
  const notificationsStorageKey = session?.user?.id 
    ? `readNotifications_${session.user.id}` 
    : "readNotifications";

  // Récupérer les notifications lues depuis localStorage (spécifique à l'utilisateur)
  const getReadNotifications = (): string[] => {
    if (typeof window === "undefined" || !session?.user?.id) return [];
    const read = localStorage.getItem(notificationsStorageKey);
    return read ? JSON.parse(read) : [];
  };

  // Marquer une notification comme lue
  const markNotificationAsRead = (notificationId: string) => {
    if (typeof window === "undefined" || !session?.user?.id) return;
    const read = getReadNotifications();
    if (!read.includes(notificationId)) {
      read.push(notificationId);
      localStorage.setItem(notificationsStorageKey, JSON.stringify(read));
      // Mettre à jour les données localement
      if (notificationsData) {
        mutateNotifications({
          ...notificationsData,
          notifications: notificationsData.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        }, false);
      }
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllNotificationsAsRead = () => {
    if (typeof window === "undefined" || !notificationsData || !session?.user?.id) return;
    const read = getReadNotifications();
    const unreadIds = processedNotifications
      .filter((n) => !n.read)
      .map((n) => n.id);
    
    unreadIds.forEach((id) => {
      if (!read.includes(id)) {
        read.push(id);
      }
    });
    
    localStorage.setItem(notificationsStorageKey, JSON.stringify(read));
    
    // Mettre à jour les données localement
    mutateNotifications({
      ...notificationsData,
      notifications: notificationsData.notifications.map((n) => ({
        ...n,
        read: true,
      })),
    }, false);
  };

  // Filtrer les notifications avec l'état "lu" depuis localStorage
  const processedNotifications = notificationsData && session?.user?.id
    ? notificationsData.notifications.map((notification) => {
        const readNotifications = getReadNotifications();
        return {
          ...notification,
          read: readNotifications.includes(notification.id),
        };
      })
    : notificationsData?.notifications || [];

  const unreadCount = processedNotifications.filter((n) => !n.read).length;

  // Messages
  const { data: messagesData, mutate: mutateMessages } = useSWR<{
    messages: Message[];
    unreadCount: number;
  }>("/api/messages", fetcher, {
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  // Clé unique par utilisateur pour les messages
  const messagesStorageKey = session?.user?.id 
    ? `readMessages_${session.user.id}` 
    : "readMessages";

  // Récupérer les messages lus depuis localStorage (spécifique à l'utilisateur)
  const getReadMessages = (): string[] => {
    if (typeof window === "undefined" || !session?.user?.id) return [];
    const read = localStorage.getItem(messagesStorageKey);
    return read ? JSON.parse(read) : [];
  };

  // Marquer un message comme lu
  const markMessageAsRead = (messageId: string) => {
    if (typeof window === "undefined" || !session?.user?.id) return;
    const read = getReadMessages();
    if (!read.includes(messageId)) {
      read.push(messageId);
      localStorage.setItem(messagesStorageKey, JSON.stringify(read));
      // Mettre à jour les données localement
      if (messagesData) {
        mutateMessages({
          ...messagesData,
          messages: messagesData.messages.map((m) =>
            m.id === messageId ? { ...m, read: true } : m
          ),
        }, false);
      }
    }
  };

  // Marquer tous les messages comme lus
  const markAllMessagesAsRead = () => {
    if (typeof window === "undefined" || !messagesData || !session?.user?.id) return;
    const read = getReadMessages();
    const unreadIds = processedMessages
      .filter((m) => !m.read)
      .map((m) => m.id);
    
    unreadIds.forEach((id) => {
      if (!read.includes(id)) {
        read.push(id);
      }
    });
    
    localStorage.setItem(messagesStorageKey, JSON.stringify(read));
    
    // Mettre à jour les données localement
    mutateMessages({
      ...messagesData,
      messages: messagesData.messages.map((m) => ({
        ...m,
        read: true,
      })),
    }, false);
  };

  // Filtrer les messages avec l'état "lu" depuis localStorage
  const processedMessages = messagesData && session?.user?.id
    ? messagesData.messages.map((message) => {
        const readMessages = getReadMessages();
        return {
          ...message,
          read: readMessages.includes(message.id),
        };
      })
    : messagesData?.messages || [];

  const unreadMessagesCount = processedMessages.filter((m) => !m.read).length;

  // Fermer les dropdowns quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setIsMessagesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Raccourci clavier Ctrl+K ou Cmd+K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsSearchOpen(true);
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setIsSearchOpen(false);
    setSearchQuery("");
    inputRef.current?.blur();
  };

  const handleNotificationClick = (notification: Notification) => {
    // Marquer comme lue si ce n'est pas déjà fait
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    router.push(notification.url);
    setIsNotificationsOpen(false);
  };

  const handleMessageClick = (message: Message) => {
    // Marquer comme lu si ce n'est pas déjà fait
    if (!message.read) {
      markMessageAsRead(message.id);
    }
    router.push(message.url);
    setIsMessagesOpen(false);
  };

  const getNotificationIcon = (icon: string) => {
    switch (icon) {
      case "calendar":
        return <BsCalendar3 className="notification-icon" />;
      case "invoice":
        return <BsCashStack className="notification-icon" />;
      case "cancel":
        return <BsFileEarmarkMedical className="notification-icon" />;
      default:
        return <BsFillBellFill className="notification-icon" />;
    }
  };

  const getMessageIcon = (icon: string) => {
    switch (icon) {
      case "consultation":
        return <BsFileEarmarkMedical className="message-icon" />;
      case "prescription":
        return <BsFileText className="message-icon" />;
      case "payment":
        return <BsCashStack className="message-icon" />;
      default:
        return <BsFillEnvelopeFill className="message-icon" />;
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "patient":
        return <BsPeopleFill className="result-icon" />;
      case "appointment":
        return <BsCalendar3 className="result-icon" />;
      case "consultation":
        return <BsFileEarmarkMedical className="result-icon" />;
      case "invoice":
        return <BsCashStack className="result-icon" />;
      case "service":
        return <BsFileText className="result-icon" />;
      default:
        return <BsSearch className="result-icon" />;
    }
  };

  const getResultTitle = (result: SearchResult) => {
    switch (result.type) {
      case "patient":
        return result.name || result.email;
      case "appointment":
        return `${result.Patient?.name || "Patient"} - ${new Date(result.startTime).toLocaleDateString("fr-FR")}`;
      case "consultation":
        return `${result.patient?.name || "Patient"} - ${result.diagnosis}`;
      case "invoice":
        return `Facture #${result.id.slice(0, 8)} - ${result.patient?.name || "Patient"}`;
      case "service":
        return result.name;
      default:
        return "Résultat";
    }
  };

  const getResultSubtitle = (result: SearchResult) => {
    switch (result.type) {
      case "patient":
        return result.email || `Âge: ${result.age} ans`;
      case "appointment":
        return `${result.Doctor?.name || "Docteur"} - ${result.status}`;
      case "consultation":
        return `${result.doctor?.name || "Docteur"} - ${new Date(result.createdAt).toLocaleDateString("fr-FR")}`;
      case "invoice":
        return `${result.amount} € - ${result.status}`;
      case "service":
        const serviceType = (result as any).serviceType;
        return `${result.price} €${serviceType ? ` - ${serviceType}` : ""}`;
      default:
        return "";
    }
  };

  const allResults: SearchResult[] = searchResults
    ? [
        ...searchResults.patients,
        ...searchResults.appointments,
        ...searchResults.consultations,
        ...searchResults.invoices,
        ...searchResults.services,
      ]
    : [];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="header">
      <div className="menu-icon">
        <BsJustify className="icon" onClick={OpenSidebar} />
      </div>
      <div className="header-left">
        <div className="header-logo">
          <span className="logo-text">Clinique Tekup</span>
        </div>
        <div className="header-search" ref={searchRef}>
          <BsSearch className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher... (Ctrl+K)"
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchOpen(true)}
          />
          {isSearchOpen && searchQuery.length >= 2 && (
            <div className="search-results">
              {isSearching ? (
                <div className="search-result-item">
                  <div className="search-loading">Recherche en cours...</div>
                </div>
              ) : allResults.length > 0 ? (
                <>
                  {searchResults?.patients && searchResults.patients.length > 0 && (
                    <div className="search-section">
                      <div className="search-section-title">Patients</div>
                      {searchResults.patients.map((result) => (
                        <div
                          key={result.id}
                          className="search-result-item"
                          onClick={() => handleResultClick(result)}
                        >
                          {getResultIcon(result.type)}
                          <div className="search-result-content">
                            <div className="search-result-title">{getResultTitle(result)}</div>
                            <div className="search-result-subtitle">{getResultSubtitle(result)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults?.appointments && searchResults.appointments.length > 0 && (
                    <div className="search-section">
                      <div className="search-section-title">Rendez-vous</div>
                      {searchResults.appointments.map((result) => (
                        <div
                          key={result.id}
                          className="search-result-item"
                          onClick={() => handleResultClick(result)}
                        >
                          {getResultIcon(result.type)}
                          <div className="search-result-content">
                            <div className="search-result-title">{getResultTitle(result)}</div>
                            <div className="search-result-subtitle">{getResultSubtitle(result)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults?.consultations && searchResults.consultations.length > 0 && (
                    <div className="search-section">
                      <div className="search-section-title">Consultations</div>
                      {searchResults.consultations.map((result) => (
                        <div
                          key={result.id}
                          className="search-result-item"
                          onClick={() => handleResultClick(result)}
                        >
                          {getResultIcon(result.type)}
                          <div className="search-result-content">
                            <div className="search-result-title">{getResultTitle(result)}</div>
                            <div className="search-result-subtitle">{getResultSubtitle(result)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults?.invoices && searchResults.invoices.length > 0 && (
                    <div className="search-section">
                      <div className="search-section-title">Factures</div>
                      {searchResults.invoices.map((result) => (
                        <div
                          key={result.id}
                          className="search-result-item"
                          onClick={() => handleResultClick(result)}
                        >
                          {getResultIcon(result.type)}
                          <div className="search-result-content">
                            <div className="search-result-title">{getResultTitle(result)}</div>
                            <div className="search-result-subtitle">{getResultSubtitle(result)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults?.services && searchResults.services.length > 0 && (
                    <div className="search-section">
                      <div className="search-section-title">Services</div>
                      {searchResults.services.map((result) => (
                        <div
                          key={result.id}
                          className="search-result-item"
                          onClick={() => handleResultClick(result)}
                        >
                          {getResultIcon(result.type)}
                          <div className="search-result-content">
                            <div className="search-result-title">{getResultTitle(result)}</div>
                            <div className="search-result-subtitle">{getResultSubtitle(result)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="search-result-item">
                  <div className="search-no-results">Aucun résultat trouvé</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="header-right">
        {/* Notifications */}
        <div className="header-icon-wrapper" ref={notificationsRef}>
          <BsFillBellFill
            className="icon"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsMessagesOpen(false);
            }}
          />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
          {isNotificationsOpen && (
            <div className="notifications-dropdown">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <span className="unread-badge">{unreadCount} non lues</span>
                )}
              </div>
              <div className="dropdown-content">
                {processedNotifications.length > 0 ? (
                  processedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.read ? "unread" : ""}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {getNotificationIcon(notification.icon)}
                      <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">
                          {new Date(notification.createdAt).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-empty">Aucune notification</div>
                )}
              </div>
              {processedNotifications.length > 0 && (
                <div className="dropdown-footer">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      style={{
                        marginBottom: "8px",
                        background: "rgba(102, 126, 234, 0.2)",
                        border: "1px solid rgba(102, 126, 234, 0.5)",
                      }}
                    >
                      Marquer tout comme lu
                    </button>
                  )}
                  <button onClick={() => router.push("/admin/appointments")}>
                    Voir toutes les notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="header-icon-wrapper" ref={messagesRef}>
          <BsFillEnvelopeFill
            className="icon"
            onClick={() => {
              setIsMessagesOpen(!isMessagesOpen);
              setIsNotificationsOpen(false);
            }}
          />
          {unreadMessagesCount > 0 && (
            <span className="notification-badge">{unreadMessagesCount}</span>
          )}
          {isMessagesOpen && (
            <div className="messages-dropdown">
              <div className="dropdown-header">
                <h3>Messages</h3>
                {unreadMessagesCount > 0 && (
                  <span className="unread-badge">{unreadMessagesCount} non lus</span>
                )}
              </div>
              <div className="dropdown-content">
                {processedMessages.length > 0 ? (
                  processedMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`message-item ${!message.read ? "unread" : ""}`}
                      onClick={() => handleMessageClick(message)}
                    >
                      {getMessageIcon(message.icon)}
                      <div className="message-content">
                        <div className="message-title">{message.title}</div>
                        <div className="message-sender">De: {message.sender}</div>
                        <div className="message-text">{message.message}</div>
                        <div className="message-time">
                          {new Date(message.createdAt).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-empty">Aucun message</div>
                )}
              </div>
              {processedMessages.length > 0 && (
                <div className="dropdown-footer">
                  {unreadMessagesCount > 0 && (
                    <button
                      onClick={markAllMessagesAsRead}
                      style={{
                        marginBottom: "8px",
                        background: "rgba(102, 126, 234, 0.2)",
                        border: "1px solid rgba(102, 126, 234, 0.5)",
                      }}
                    >
                      Marquer tout comme lu
                    </button>
                  )}
                  <button onClick={() => router.push("/doctor/consultations")}>
                    Voir tous les messages
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="header-user" onClick={handleSignOut}>
          <BsPersonCircle className="icon user-icon" />
          <div className="user-info">
            <span className="user-email">{session?.user?.email}</span>
            <span className="user-role">{session?.user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}


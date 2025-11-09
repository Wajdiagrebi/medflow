"use client";

import React from "react";
import {
  BsFillBellFill,
  BsFillEnvelopeFill,
  BsPersonCircle,
  BsSearch,
  BsJustify,
} from "react-icons/bs";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  OpenSidebar: () => void;
}

export default function Header({ OpenSidebar }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="header">
      <div className="menu-icon">
        <BsJustify className="icon" onClick={OpenSidebar} />
      </div>
      <div className="header-left">
        <BsSearch className="icon" />
      </div>
      <div className="header-right">
        <BsFillBellFill className="icon" />
        <BsFillEnvelopeFill className="icon" />
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleSignOut}>
          <BsPersonCircle className="icon" />
          <span className="text-sm text-gray-300">{session?.user?.email}</span>
        </div>
      </div>
    </header>
  );
}


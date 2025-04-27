"use client";

import PublicRoute from "@/components/PublicRoute";
import WebNavBar from "@/components/website/WebNavBar";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user: authUser } = useAuth();
  const [isLoggedIn] = useState(!!authUser);

  return (
    <PublicRoute>
      <div style={{ minHeight: "100vh", background: "#ffffff" }}>
        <WebNavBar isLoggedIn={isLoggedIn} />
        {children}
      </div>
    </PublicRoute>
  );
}

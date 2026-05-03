import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface LayoutProps {
  role: "admin" | "bdm";
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
}

export function Layout({ role, user }: LayoutProps) {
  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


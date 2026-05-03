import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getStoredUser } from "../api/api";

type Role = "admin" | "agm" | "rm" | "bdm";

export function RequireRole({
  allow,
  redirectTo,
}: {
  allow: Role[];
  redirectTo: string;
}) {
  const user = getStoredUser() as { role?: Role } | null;
  const role = user?.role;

  if (!role || !allow.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}


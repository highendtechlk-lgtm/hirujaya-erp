import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getStoredUser, getToken } from "../api/api";

export function RequireAuth() {
  const location = useLocation();
  const token = getToken();
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}


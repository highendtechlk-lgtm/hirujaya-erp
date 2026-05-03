import React, { useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/RequireAuth";
import { RequireRole } from "./components/RequireRole";
import { LoginPage } from "./pages/LoginPage";
import { CreateAccountPage } from "./pages/CreateAccountPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { BDMDashboard } from "./pages/BDMDashboard";
import { CreateQuotationPage } from "./pages/CreateQuotationPage";
import { AdminQuotationsPage } from "./pages/AdminQuotationsPage";
import { BdmQuotationsPage } from "./pages/BdmQuotationsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { ComponentsPage } from "./pages/ComponentsPage";
import { PackagesPage } from "./pages/PackagesPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SalesReportPage } from "./pages/SalesReportPage";
import { OutstandingReportPage } from "./pages/OutstandingReportPage";
import { TeamPage } from "./pages/TeamPage";
import { SettingsPage } from "./pages/SettingsPage";
import { apiFetch, getStoredUser, getToken } from "./api/api";

type StoredUser = {
  full_name: string;
  role: "admin" | "agm" | "rm" | "bdm";
  email?: string;
};

export function App() {
  useEffect(() => {
    apiFetch("/health")
      .then((data) => console.log("✅ Backend connected:", data))
      .catch((err) => console.error("❌ Backend connection error:", err));
  }, []);

  const storedUser = getStoredUser() as StoredUser | null;
  const token = getToken();

  const layoutUser = useMemo(() => {
    if (!storedUser) return null;
    return {
      name: storedUser.full_name,
      role: storedUser.role.toUpperCase(),
      avatar: undefined as string | undefined,
    };
  }, [storedUser]);

  const homeRedirect = () => {
    if (!token || !storedUser) return <Navigate to="/login" replace />;
    if (storedUser.role === "admin" || storedUser.role === "agm") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/bdm/dashboard" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<CreateAccountPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<RequireRole allow={["admin", "agm"]} redirectTo="/bdm/dashboard" />}>
            <Route
              path="/admin"
              element={<Layout role="admin" user={layoutUser ?? { name: "User", role: "ADMIN" }} />}
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="quotations" element={<AdminQuotationsPage />} />
              <Route path="components" element={<ComponentsPage />} />
              <Route path="products" element={<PackagesPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="reports/sales" element={<SalesReportPage />} />
              <Route path="reports/outstanding" element={<OutstandingReportPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="team" element={<TeamPage />} />
            </Route>
          </Route>

          <Route element={<RequireRole allow={["bdm", "rm"]} redirectTo="/admin/dashboard" />}>
            <Route
              path="/bdm"
              element={<Layout role="bdm" user={layoutUser ?? { name: "User", role: "BDM" }} />}
            >
              <Route index element={<Navigate to="/bdm/dashboard" replace />} />
              <Route path="dashboard" element={<BDMDashboard />} />
              <Route path="quotations" element={<BdmQuotationsPage />} />
              <Route path="quotations/new" element={<CreateQuotationPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={homeRedirect()} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


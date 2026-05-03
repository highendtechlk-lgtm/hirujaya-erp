import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Package,
  CreditCard,
  Users,
  BarChart2,
  Settings,
  PlusCircle,
  Users2,
  Boxes,
  LogOut,
} from "lucide-react";
import { logout } from "../services/authService";

interface SidebarProps {
  role: "admin" | "bdm";
}

export function Sidebar({ role }: SidebarProps) {
  const location = useLocation();

  const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Quotations", path: "/admin/quotations", icon: FileText },
    { name: "Components", path: "/admin/components", icon: Boxes },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Payments", path: "/admin/payments", icon: CreditCard },
    { name: "Customers", path: "/admin/customers", icon: Users },
    { name: "Reports", path: "/admin/reports", icon: BarChart2 },
    { name: "Sales Report", path: "/admin/reports/sales", icon: BarChart2 },
    { name: "Outstanding", path: "/admin/reports/outstanding", icon: BarChart2 },
    { name: "Team", path: "/admin/team", icon: Users2 },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const bdmLinks = [
    { name: "Dashboard", path: "/bdm/dashboard", icon: LayoutDashboard },
    { name: "Quotations", path: "/bdm/quotations", icon: FileText },
    { name: "Customers", path: "/bdm/customers", icon: Users },
    { name: "Team", path: "/bdm/team", icon: Users2 },
    { name: "Settings", path: "/bdm/settings", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const links = role === "admin" ? adminLinks : bdmLinks;

  return (
    <div className="w-64 bg-brand-navy h-screen flex flex-col text-white flex-shrink-0">
      <div className="p-6 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-green flex items-center justify-center rounded-sm font-bold text-white text-xl">
            E3
          </div>
          <div className="flex flex-col">
            <span className="text-brand-navy font-bold leading-tight tracking-tight">
              HIRUJAYA
            </span>
            <span className="text-brand-green font-bold leading-tight tracking-tight">
              GREEN
            </span>
            <span className="text-brand-navy font-bold leading-tight tracking-tight">
              ENERGY
            </span>
            <span className="text-brand-navy text-[8px] tracking-widest mt-0.5">
              PURE POWER
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.path);
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? "bg-brand-navy-light text-white border-l-4 border-brand-green"
                  : "text-gray-300 hover:bg-brand-navy-light hover:text-white"
              }`}
            >
              <Icon size={20} className={isActive ? "text-brand-green" : ""} />
              <span className="font-medium">{link.name}</span>
            </NavLink>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-gray-300 hover:bg-red-500/10 hover:text-red-400 w-full text-left mt-4"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </nav>

      <div className="p-4">
        {role === "admin" ? (
          <button
            type="button"
            className="w-full bg-brand-green hover:bg-brand-green-hover text-white py-3 px-4 rounded-md flex items-center justify-center gap-2 font-medium transition-colors"
          >
            <PlusCircle size={20} />
            New Installation
          </button>
        ) : (
          <NavLink
            to="/bdm/quotations/new"
            className="w-full bg-brand-green hover:bg-brand-green-hover text-white py-3 px-4 rounded-md flex items-center justify-center gap-2 font-medium transition-colors"
          >
            <PlusCircle size={20} />
            New Quotation
          </NavLink>
        )}
      </div>
    </div>
  );
}


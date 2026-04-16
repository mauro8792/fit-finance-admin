"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Users,
  LogOut,
  Dumbbell,
  Package,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const navItems = [
  {
    label: "Dashboard",
    href: "/overview",
    icon: LayoutDashboard,
  },
  {
    label: "Organizaciones",
    href: "/organizations",
    icon: Building2,
  },
  {
    label: "Coaches",
    href: "/coaches",
    icon: Users,
  },
  {
    label: "Suscripciones",
    href: "/subscriptions",
    icon: CreditCard,
  },
  {
    label: "Planes",
    href: "/plans",
    icon: Package,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-sidebar border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-text tracking-tight">
              Fit Finance
            </h1>
            <p className="text-[10px] text-text-dim uppercase tracking-wider">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-sidebar-active text-primary font-medium"
                  : "text-text-muted hover:bg-sidebar-hover hover:text-text"
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${isActive ? "text-primary" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-text truncate">
              {user?.fullName || "Admin"}
            </p>
            <p className="text-[10px] text-text-dim truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md text-text-dim hover:text-error hover:bg-error-light transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

"use client";

import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: "primary" | "success" | "warning" | "error" | "info";
  trend?: { value: string; positive: boolean };
}

const colorMap = {
  primary: {
    bg: "bg-primary-light",
    text: "text-primary",
    icon: "text-primary",
  },
  success: {
    bg: "bg-success-light",
    text: "text-success",
    icon: "text-success",
  },
  warning: {
    bg: "bg-warning-light",
    text: "text-warning",
    icon: "text-warning",
  },
  error: {
    bg: "bg-error-light",
    text: "text-error",
    icon: "text-error",
  },
  info: {
    bg: "bg-info-light",
    text: "text-info",
    icon: "text-info",
  },
};

export function StatCard({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) {
  const c = colorMap[color];

  return (
    <div className="bg-surface rounded-xl border border-border p-5 hover:border-border-light transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend.positive
                ? "bg-success-light text-success"
                : "bg-error-light text-error"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-xs text-text-muted mt-0.5">{title}</p>
      {subtitle && (
        <p className="text-[10px] text-text-dim mt-1">{subtitle}</p>
      )}
    </div>
  );
}

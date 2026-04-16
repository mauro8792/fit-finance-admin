"use client";

interface BadgeProps {
  variant: "success" | "warning" | "error" | "info" | "default";
  children: React.ReactNode;
  className?: string;
}

const variantMap = {
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  error: "bg-error-light text-error",
  info: "bg-info-light text-info",
  default: "bg-surface text-text-muted",
};

export function Badge({ variant, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${variantMap[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeProps["variant"]; label: string }> = {
    active: { variant: "success", label: "Activa" },
    trial: { variant: "info", label: "Trial" },
    expired: { variant: "error", label: "Expirada" },
    suspended: { variant: "warning", label: "Suspendida" },
    cancelled: { variant: "default", label: "Cancelada" },
    // Soporte legacy para mayúsculas
    ACTIVE: { variant: "success", label: "Activa" },
    TRIAL: { variant: "info", label: "Trial" },
    EXPIRED: { variant: "error", label: "Expirada" },
    SUSPENDED: { variant: "warning", label: "Suspendida" },
    CANCELLED: { variant: "default", label: "Cancelada" },
  };

  const config = map[status] || { variant: "default" as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function OrgTypeBadge({ type }: { type: string }) {
  const map: Record<string, { variant: BadgeProps["variant"]; label: string }> = {
    independent_coach: { variant: "info", label: "Coach" },
    gym: { variant: "success", label: "Gym" },
    // Soporte legacy para mayúsculas
    INDEPENDENT_COACH: { variant: "info", label: "Coach" },
    GYM: { variant: "success", label: "Gym" },
  };
  const config = map[type] || { variant: "default" as const, label: type };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

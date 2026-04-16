"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  UserCheck,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge, OrgTypeBadge } from "@/components/ui/Badge";
import {
  getOrganizations,
  getSubscriptions,
  getPlans,
  type OrganizationData,
  type SubscriptionData,
  type SubscriptionPlanData,
} from "@/lib/api";

export default function OverviewPage() {
  const [orgs, setOrgs] = useState<OrganizationData[]>([]);
  const [subs, setSubs] = useState<SubscriptionData[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [orgsData, subsData, plansData] = await Promise.all([
          getOrganizations().catch(() => []),
          getSubscriptions().catch(() => []),
          getPlans().catch(() => []),
        ]);
        setOrgs(orgsData);
        setSubs(subsData);
        setPlans(plansData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeOrgs = orgs.filter((o) => o.isActive);
  const activeSubs = subs.filter(
    (s) => s.status === "active" || s.status === "trial"
  );
  const trialSubs = subs.filter((s) => s.status === "trial");
  const expiringSoon = trialSubs.filter((s) => {
    if (!s.trialEndsAt) return false;
    const diff =
      new Date(s.trialEndsAt).getTime() - Date.now();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // 3 días
  });

  // Revenue estimate
  const monthlyRevenue = activeSubs.reduce((acc, s) => {
    const plan = plans.find((p) => p.id === s.planId);
    return acc + (Number(plan?.priceUsd) || 0);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">
          Resumen general de la plataforma
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Organizaciones activas"
          value={activeOrgs.length}
          subtitle={`${orgs.length} totales`}
          icon={Building2}
          color="primary"
        />
        <StatCard
          title="Suscripciones activas"
          value={activeSubs.length}
          subtitle={`${trialSubs.length} en trial`}
          icon={CreditCard}
          color="success"
        />
        <StatCard
          title="Trials por vencer"
          value={expiringSoon.length}
          subtitle="Próximos 3 días"
          icon={Clock}
          color={expiringSoon.length > 0 ? "warning" : "info"}
        />
        <StatCard
          title="Revenue mensual est."
          value={`$${monthlyRevenue.toFixed(0)} USD`}
          subtitle={`${activeSubs.filter((s) => s.status === "active").length} planes pagos`}
          icon={DollarSign}
          color="success"
        />
      </div>

      {/* Recent Orgs + Expiring Trials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organizations table */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">Organizaciones</h2>
            <a
              href="/organizations"
              className="text-xs text-primary hover:text-primary-hover"
            >
              Ver todas
            </a>
          </div>
          {orgs.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">
              No hay organizaciones todavía
            </div>
          ) : (
            <div className="divide-y divide-border">
              {orgs.slice(0, 5).map((org) => {
                const sub = subs.find((s) => s.organizationId === org.id);
                return (
                  <div
                    key={org.id}
                    className="px-5 py-3 flex items-center justify-between hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{
                          backgroundColor: org.primaryColor || "#6366f1",
                        }}
                      >
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">
                          {org.name}
                        </p>
                        <p className="text-[10px] text-text-dim">{org.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <OrgTypeBadge type={org.type} />
                      {sub && <StatusBadge status={sub.status} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expiring trials */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h2 className="text-sm font-semibold text-text">
              Trials próximos a vencer
            </h2>
          </div>
          {trialSubs.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">
              No hay trials activos
            </div>
          ) : (
            <div className="divide-y divide-border">
              {trialSubs.map((sub) => {
                const org = orgs.find((o) => o.id === sub.organizationId);
                const daysLeft = sub.trialEndsAt
                  ? Math.ceil(
                      (new Date(sub.trialEndsAt).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : null;
                return (
                  <div
                    key={sub.id}
                    className="px-5 py-3 flex items-center justify-between hover:bg-surface-hover transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {org?.name || `Org #${sub.organizationId}`}
                      </p>
                      <p className="text-[10px] text-text-dim">
                        Inició:{" "}
                        {new Date(sub.startDate).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                    <div className="text-right">
                      {daysLeft !== null && daysLeft > 0 ? (
                        <span
                          className={`text-sm font-bold ${
                            daysLeft <= 3
                              ? "text-error"
                              : daysLeft <= 7
                              ? "text-warning"
                              : "text-info"
                          }`}
                        >
                          {daysLeft}d restantes
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-error">
                          Vencido
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

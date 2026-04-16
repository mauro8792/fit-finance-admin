"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Users,
  UserCheck,
  CreditCard,
  Globe,
  Mail,
  Phone,
  Calendar,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { StatusBadge, OrgTypeBadge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import {
  getOrganization,
  getOrganizationStats,
  getSubscriptions,
  type OrganizationData,
  type SubscriptionData,
} from "@/lib/api";
import { toast } from "sonner";

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [org, setOrg] = useState<OrganizationData | null>(null);
  const [stats, setStats] = useState<{
    coaches: number;
    students: number;
    activeStudents: number;
  } | null>(null);
  const [subs, setSubs] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const orgId = Number(id);
        const [orgData, statsData, subsData] = await Promise.all([
          getOrganization(orgId),
          getOrganizationStats(orgId).catch(() => null),
          getSubscriptions().then((all) =>
            all.filter((s) => s.organizationId === orgId)
          ),
        ]);
        setOrg(orgData);
        setStats(statsData);
        setSubs(subsData);
      } catch {
        toast.error("Error cargando organización");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-center py-20 text-text-muted">
        Organización no encontrada
      </div>
    );
  }

  const activeSub = subs.find(
    (s) => s.status === "active" || s.status === "trial"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/organizations"
            className="p-2 rounded-lg hover:bg-surface transition-colors text-text-muted hover:text-text"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: org.primaryColor || "#6366f1" }}
            >
              {org.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-text">{org.name}</h1>
                <OrgTypeBadge type={org.type} />
              </div>
              <p className="text-xs text-text-dim">{org.slug}</p>
            </div>
          </div>
        </div>
        <Link
          href={`/organizations/${id}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border border-border text-sm text-text rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
          Editar
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Coaches"
            value={stats.coaches}
            icon={UserCheck}
            color="primary"
            subtitle={
              activeSub?.plan
                ? `Máx: ${(activeSub.plan as any).maxCoaches ?? "∞"}`
                : undefined
            }
          />
          <StatCard
            title="Alumnos totales"
            value={stats.students}
            icon={Users}
            color="info"
            subtitle={
              activeSub?.plan
                ? `Máx: ${(activeSub.plan as any).maxStudents ?? "∞"}`
                : undefined
            }
          />
          <StatCard
            title="Alumnos activos"
            value={stats.activeStudents}
            icon={Users}
            color="success"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text">Información</h2>
          <div className="space-y-3">
            <InfoRow
              icon={Globe}
              label="Slug"
              value={org.slug}
            />
            {org.contactEmail && (
              <InfoRow icon={Mail} label="Email" value={org.contactEmail} />
            )}
            {org.contactPhone && (
              <InfoRow icon={Phone} label="Teléfono" value={org.contactPhone} />
            )}
            <InfoRow
              icon={Calendar}
              label="Creada"
              value={new Date(org.createdAt).toLocaleDateString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          </div>
        </div>

        {/* Suscripciones */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-text">Suscripciones</h2>
          </div>
          {subs.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">
              Sin suscripciones
            </div>
          ) : (
            <div className="divide-y divide-border">
              {subs.map((sub) => (
                <div
                  key={sub.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text">
                        {sub.plan?.name || `Plan #${sub.planId}`}
                      </p>
                      <StatusBadge status={sub.status} />
                    </div>
                    <p className="text-[10px] text-text-dim mt-0.5">
                      Desde{" "}
                      {new Date(sub.startDate).toLocaleDateString("es-AR")}
                      {sub.trialEndsAt &&
                        ` · Trial hasta ${new Date(
                          sub.trialEndsAt
                        ).toLocaleDateString("es-AR")}`}
                    </p>
                  </div>
                  <Link
                    href={`/subscriptions?org=${org.id}`}
                    className="text-xs text-primary hover:text-primary-hover"
                  >
                    Gestionar
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PWA & Logo */}
      <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-text">PWA & Logo</h2>
        </div>

        {/* Logo preview */}
        <div className="flex items-center gap-4">
          {(org as any).logoUrl ? (
            <div className="flex items-center gap-4">
              <div className="bg-[#0a0a0f] rounded-xl p-3 border border-border">
                <img
                  src={(org as any).logoUrl}
                  alt={org.name}
                  className="h-16 w-16 object-contain"
                />
              </div>
              {(org as any).logoLightUrl && (
                <div className="bg-white rounded-xl p-3 border border-border">
                  <img
                    src={(org as any).logoLightUrl}
                    alt={`${org.name} (light)`}
                    className="h-16 w-16 object-contain"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-bg border border-border">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                style={{ backgroundColor: org.primaryColor || "#6366f1" }}
              >
                {org.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-xs text-text-dim">Sin logo — se usa la inicial</p>
            </div>
          )}
        </div>

        {/* URLs */}
        <PwaUrlBlock slug={org.slug} />

        {org.footerText && (
          <p className="text-xs text-text-dim">Footer: {org.footerText}</p>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-text-dim shrink-0" />
      <div>
        <p className="text-[10px] text-text-dim">{label}</p>
        <p className="text-sm text-text">{value}</p>
      </div>
    </div>
  );
}

const PWA_DOMAIN = process.env.NEXT_PUBLIC_PWA_DOMAIN || "bracamp.vercel.app";

function getBaseOrigin(): string {
  const parts = PWA_DOMAIN.split(".");
  if (parts.length >= 3) return parts.slice(1).join(".");
  return PWA_DOMAIN;
}

function PwaUrlBlock({ slug }: { slug: string }) {
  const baseOrigin = getBaseOrigin();
  const prodUrl = `https://${slug}.${baseOrigin}`;
  const devUrl = `http://localhost:3001/auth/login?org=${slug}`;

  return (
    <div className="space-y-2">
      <p className="text-xs text-text-muted font-medium">URLs de acceso</p>
      <div className="space-y-1.5">
        <UrlRow label="Producción" url={prodUrl} />
        <UrlRow label="Desarrollo" url={devUrl} muted />
      </div>
      <p className="text-[10px] text-text-dim">
        Compartí la URL de producción con el cliente para que acceda a la app.
      </p>
    </div>
  );
}

function UrlRow({ label, url, muted }: { label: string; url: string; muted?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-text-dim w-16 shrink-0">{label}:</span>
      <code className={`text-[11px] px-1.5 py-0.5 rounded truncate ${
        muted ? "text-text-muted bg-surface" : "text-accent bg-accent/10"
      }`}>
        {url}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="p-1 rounded hover:bg-surface-hover transition-colors text-text-dim hover:text-text shrink-0"
        title="Copiar URL"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
      {!muted && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded hover:bg-surface-hover transition-colors text-text-dim hover:text-text shrink-0"
          title="Abrir en nueva pestaña"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}

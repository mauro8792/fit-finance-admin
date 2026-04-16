"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, ImageIcon, CreditCard, Save } from "lucide-react";
import Link from "next/link";
import {
  createOrganization,
  createSubscription,
  getPlans,
  type SubscriptionPlanData,
} from "@/lib/api";
import { toast } from "sonner";
import ImageUploader from "@/components/ui/ImageUploader";
import PwaIconGuide from "@/components/ui/PwaIconGuide";

export default function NewOrganizationPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "independent_coach" as "independent_coach" | "gym",
    contactEmail: "",
    contactPhone: "",
    logoUrl: "",
    logoLightUrl: "",
    icon192: "",
    icon512: "",
    footerText: "",
    planId: "",
    startAsTrial: true,
  });

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => toast.error("Error cargando planes"));
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug from name
      if (field === "name") {
        updated.slug = (value as string)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      // Auto-generate footer from name
      if (field === "name" && !prev.footerText) {
        updated.footerText = `© ${new Date().getFullYear()} ${value}. Todos los derechos reservados.`;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.slug) {
      toast.error("Nombre y slug son obligatorios");
      return;
    }

    setLoading(true);
    try {
      // 1. Crear org
      const org = await createOrganization({
        name: form.name,
        slug: form.slug,
        type: form.type,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        logoUrl: form.logoUrl || undefined,
        logoLightUrl: form.logoLightUrl || undefined,
        icon192: form.icon192 || undefined,
        icon512: form.icon512 || undefined,
        footerText: form.footerText,
      });

      // 2. Crear suscripción si se seleccionó un plan
      if (form.planId) {
        const selectedPlan = plans.find(
          (p) => p.id === Number(form.planId)
        );
        const now = new Date();
        const subData: Record<string, unknown> = {
          organizationId: org.id,
          planId: Number(form.planId),
          startDate: now.toISOString().split("T")[0],
        };

        if (form.startAsTrial) {
          subData.status = "trial";
          const trialEnd = new Date(now);
          trialEnd.setDate(trialEnd.getDate() + 14);
          subData.trialEndsAt = trialEnd.toISOString().split("T")[0];
        } else {
          subData.status = "active";
          const nextBilling = new Date(now);
          nextBilling.setMonth(nextBilling.getMonth() + 1);
          subData.nextBillingDate = nextBilling.toISOString().split("T")[0];
        }

        await createSubscription(subData as any);
      }

      toast.success(`Organización "${org.name}" creada exitosamente`);
      router.push("/organizations");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error creando organización";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/organizations"
          className="p-2 rounded-lg hover:bg-surface transition-colors text-text-muted hover:text-text"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text">Nueva organización</h1>
          <p className="text-sm text-text-muted">
            Dar de alta un gym o coach independiente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos generales */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-text">
              Datos generales
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium">
                Nombre *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Mi Gym"
                className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text placeholder:text-text-dim"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium">
                Slug (URL) *
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                placeholder="mi-gym"
                className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text placeholder:text-text-dim"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-medium">Tipo</label>
            <select
              value={form.type}
              onChange={(e) =>
                handleChange("type", e.target.value)
              }
              className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
            >
              <option value="independent_coach">Coach independiente</option>
              <option value="gym">Gym</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium">
                Email contacto
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  handleChange("contactEmail", e.target.value)
                }
                placeholder="contacto@migym.com"
                className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text placeholder:text-text-dim"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium">
                Teléfono
              </label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) =>
                  handleChange("contactPhone", e.target.value)
                }
                placeholder="+54 11 1234-5678"
                className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text placeholder:text-text-dim"
              />
            </div>
          </div>
        </div>

        {/* Logo & Identidad */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-text">Logo e identidad</h2>
          </div>

          <PwaIconGuide slug={form.slug} />

          <div className="grid grid-cols-2 gap-4">
            <ImageUploader
              label="Logo principal (fondo oscuro)"
              currentUrl={form.logoUrl}
              onUploaded={(url) => handleChange("logoUrl", url)}
              folder={`fit-finance/organizations/${form.slug || "default"}`}
              variant="dark"
              requireSquare
              minSize={512}
            />
            <ImageUploader
              label="Logo alternativo (fondo claro)"
              currentUrl={form.logoLightUrl}
              onUploaded={(url) => handleChange("logoLightUrl", url)}
              folder={`fit-finance/organizations/${form.slug || "default"}`}
              variant="light"
              requireSquare
              minSize={512}
            />
          </div>

          <div className="rounded-lg border border-border bg-bg/50 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-text">
                  Iconos PWA (instalación en celular)
                </p>
                <p className="text-[11px] text-text-dim mt-0.5">
                  Mismas URLs en Cloudinary que consumirá el manifest de la PWA. Opcional al crear;
                  podés editarlos después.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!form.logoUrl) {
                    toast.error("Subí primero el logo principal");
                    return;
                  }
                  setForm((prev) => ({
                    ...prev,
                    icon192: prev.logoUrl,
                    icon512: prev.logoUrl,
                  }));
                  toast.success(
                    "Iconos 192 y 512 alineados con el logo principal",
                  );
                }}
                className="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-border text-text-muted hover:text-text hover:bg-surface transition-colors"
              >
                Usar logo principal para ambos
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ImageUploader
                label="Icono 192×192 (PWA)"
                currentUrl={form.icon192}
                onUploaded={(url) => handleChange("icon192", url)}
                folder={`fit-finance/organizations/${form.slug || "default"}/pwa-icons`}
                variant="dark"
                requireSquare
                minSize={192}
              />
              <ImageUploader
                label="Icono 512×512 (PWA / maskable)"
                currentUrl={form.icon512}
                onUploaded={(url) => handleChange("icon512", url)}
                folder={`fit-finance/organizations/${form.slug || "default"}/pwa-icons`}
                variant="dark"
                requireSquare
                minSize={512}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-medium">
              Texto del footer
            </label>
            <input
              type="text"
              value={form.footerText}
              onChange={(e) => handleChange("footerText", e.target.value)}
              placeholder="© 2026 Mi Gym. Todos los derechos reservados."
              className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text placeholder:text-text-dim"
            />
          </div>

          {/* Preview */}
          <div className="mt-4 p-4 rounded-lg border border-border-light bg-[#0a0a0f]">
            <p className="text-xs text-text-dim mb-2">Vista previa:</p>
            <div className="flex items-center gap-3">
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt={form.name}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold bg-primary">
                  {form.name ? form.name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-primary">
                  {form.name || "Nombre"}
                </p>
                <p className="text-[10px] text-accent">
                  {form.slug || "slug"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-text">
              Plan de suscripción
            </h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-medium">
              Plan inicial
            </label>
            <select
              value={form.planId}
              onChange={(e) => handleChange("planId", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
            >
              <option value="">Sin plan (solo crear organización)</option>
              {plans
                .filter((p) => p.isActive && p.type !== "PERSONAL")
                .map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — Máx {plan.maxStudents ?? "∞"} alumnos,{" "}
                    {plan.maxCoaches ?? "∞"} coaches — ${plan.priceUsd} USD/mes
                  </option>
                ))}
            </select>
          </div>

          {form.planId && (
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input
                type="checkbox"
                checked={form.startAsTrial}
                onChange={(e) =>
                  handleChange("startAsTrial", e.target.checked)
                }
                className="rounded border-border"
              />
              Iniciar como Trial (14 días gratis)
            </label>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href="/organizations"
            className="px-4 py-2.5 rounded-lg border border-border text-sm text-text-muted hover:text-text hover:bg-surface transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Crear organización
          </button>
        </div>
      </form>
    </div>
  );
}

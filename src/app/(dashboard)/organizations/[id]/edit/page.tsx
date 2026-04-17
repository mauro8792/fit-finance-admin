"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Save, Loader2, ImageIcon } from "lucide-react";
import Link from "next/link";
import {
  getOrganization,
  patchOrganizationBranding,
  updateOrganization,
  type LoginHeroScale,
  type OrganizationData,
} from "@/lib/api";
import { toast } from "sonner";
import ImageUploader from "@/components/ui/ImageUploader";
import PwaIconGuide from "@/components/ui/PwaIconGuide";
import { LoginScreenPreview } from "@/components/organizations/LoginScreenPreview";

export default function EditOrganizationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "independent_coach" as "independent_coach" | "gym",
    contactEmail: "",
    contactPhone: "",
    footerText: "",
    logoUrl: "",
    logoLightUrl: "",
    icon192: "",
    icon512: "",
    loginImageUrl: "",
    loginHeroScale: "default" as LoginHeroScale,
    isActive: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const org = await getOrganization(Number(id));
        setForm({
          name: org.name || "",
          slug: org.slug || "",
          type: org.type || "independent_coach",
          contactEmail: org.contactEmail || "",
          contactPhone: org.contactPhone || "",
          footerText: org.footerText || "",
          logoUrl: org.logoUrl || "",
          logoLightUrl: org.logoLightUrl || "",
          icon192: org.icon192 || "",
          icon512: org.icon512 || "",
          loginImageUrl: org.loginImageUrl || "",
          loginHeroScale:
            (org.loginHeroScale as LoginHeroScale | undefined) || "default",
          isActive: org.isActive,
        });
      } catch {
        toast.error("Error cargando organización");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast.error("Nombre y slug son obligatorios");
      return;
    }

    setSaving(true);
    try {
      await updateOrganization(Number(id), {
        name: form.name,
        slug: form.slug,
        type: form.type,
        isActive: form.isActive,
      });
      await patchOrganizationBranding(Number(id), {
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        footerText: form.footerText,
        logoUrl: form.logoUrl || undefined,
        logoLightUrl: form.logoLightUrl || undefined,
        icon192: form.icon192 || undefined,
        icon512: form.icon512 || undefined,
        loginImageUrl:
          form.loginImageUrl.trim() === ""
            ? ""
            : form.loginImageUrl.trim() || undefined,
        loginHeroScale: form.loginHeroScale,
      });
      toast.success("Organización actualizada");
      router.push(`/organizations/${id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error actualizando";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/organizations/${id}`}
          className="p-2 rounded-lg hover:bg-surface transition-colors text-text-muted hover:text-text"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text">Editar organización</h1>
          <p className="text-sm text-text-muted">{form.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-start">
          {/* Columna principal */}
          <div className="xl:col-span-7 space-y-6 min-w-0">
        {/* Datos generales */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-text">Datos generales</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium">Slug (URL) *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
              >
                <option value="independent_coach">Coach independiente</option>
                <option value="gym">Gym</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium">Estado</label>
              <select
                value={form.isActive ? "true" : "false"}
                onChange={(e) => handleChange("isActive", e.target.value === "true")}
                className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
              >
                <option value="true">Activa</option>
                <option value="false">Inactiva</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium">Email contacto</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                placeholder="contacto@org.com"
                className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text placeholder:text-text-dim"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium">Teléfono</label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
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
                  Se guardan en Cloudinary y la app instalable (`fit-finance-ui-3`) usa estas URLs en el
                  manifest. Podés generar tamaños con herramientas externas y subir los PNG acá.
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
                    "Iconos 192 y 512 apuntan al mismo archivo que el logo principal",
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
            <label className="text-xs text-text-muted font-medium">Texto del footer</label>
            <input
              type="text"
              value={form.footerText}
              onChange={(e) => handleChange("footerText", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text placeholder:text-text-dim"
            />
          </div>
        </div>
          </div>

          {/* Columna lateral: login (preview) */}
          <div className="xl:col-span-5 min-w-0">
            <div className="xl:sticky xl:top-6 space-y-4 bg-surface rounded-xl border border-border p-5">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                <h2 className="text-sm font-semibold text-text">
                  Pantalla de login
                </h2>
              </div>
              <p className="text-[11px] text-text-dim">
                Opcional. Si subís un archivo, es el que verán arriba del
                formulario en <span className="text-text-muted">/auth/login</span>
                . Si no, se usa el logo principal.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!form.logoUrl) {
                    toast.error("Subí primero el logo principal");
                    return;
                  }
                  handleChange("loginImageUrl", form.logoUrl);
                  toast.success("Imagen de login alineada con el logo principal");
                }}
                className="w-full sm:w-auto text-xs px-3 py-1.5 rounded-lg border border-border text-text-muted hover:text-text hover:bg-bg transition-colors"
              >
                Usar logo principal
              </button>
              <ImageUploader
                label="Archivo (PNG, JPG o WEBP; puede ser rectangular)"
                currentUrl={form.loginImageUrl}
                onUploaded={(url) => handleChange("loginImageUrl", url)}
                folder={`fit-finance/organizations/${form.slug || "default"}/login`}
                variant="dark"
                requireSquare={false}
                minSize={0}
              />
              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-medium">
                  Tamaño en pantalla de login
                </label>
                <select
                  value={form.loginHeroScale}
                  onChange={(e) =>
                    handleChange("loginHeroScale", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                >
                  <option value="compact">Compacto — menos alto (logos muy grandes)</option>
                  <option value="default">Normal — recomendado</option>
                  <option value="comfortable">Cómodo — un poco más grande</option>
                </select>
                <p className="text-[10px] text-text-dim leading-snug">
                  Recomendación para el archivo: ancho máx. ~800px, PNG o WebP con
                  fondo transparente; el recorte importa más que los píxeles exactos.
                </p>
              </div>
              <LoginScreenPreview
                orgName={form.name}
                logoUrl={form.logoUrl}
                loginImageUrl={form.loginImageUrl}
                loginHeroScale={form.loginHeroScale}
                footerText={form.footerText}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2 border-t border-border xl:border-0 xl:pt-0">
          <Link
            href={`/organizations/${id}`}
            className="px-4 py-2.5 rounded-lg border border-border text-sm text-text-muted hover:text-text hover:bg-surface transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}

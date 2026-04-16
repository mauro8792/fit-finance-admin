"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import {
  createCompleteCoach,
  getOrganizations,
  getSports,
  type OrganizationData,
} from "@/lib/api";
import { toast } from "sonner";

export default function NewCoachPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<OrganizationData[]>([]);
  const [sports, setSports] = useState<{ id: number; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    organizationId: "",
    sportIds: [] as number[],
    specialization: "",
  });

  useEffect(() => {
    Promise.all([getOrganizations(), getSports()])
      .then(([orgsData, sportsData]) => {
        setOrgs(orgsData.filter((o) => o.isActive));
        setSports(sportsData);
      })
      .catch(() => toast.error("Error cargando datos"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password || !form.fullName) {
      toast.error("Completá los campos obligatorios");
      return;
    }

    if (form.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(form.password)) {
      toast.error("La contraseña debe tener al menos una mayúscula, una minúscula y un número");
      return;
    }

    setSaving(true);
    try {
      await createCompleteCoach({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        organizationId: form.organizationId ? Number(form.organizationId) : undefined,
        sportIds: form.sportIds.length > 0 ? form.sportIds : undefined,
        specialization: form.specialization || undefined,
      });
      toast.success("Coach creado exitosamente");
      router.push("/coaches");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Error creando coach";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    } finally {
      setSaving(false);
    }
  };

  const toggleSport = (sportId: number) => {
    setForm((prev) => ({
      ...prev,
      sportIds: prev.sportIds.includes(sportId)
        ? prev.sportIds.filter((id) => id !== sportId)
        : [...prev.sportIds, sportId],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/coaches"
          className="p-2 rounded-lg hover:bg-surface transition-colors text-text-muted hover:text-text"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text">Nuevo coach</h1>
          <p className="text-xs text-text-dim">Crear usuario y perfil de coach</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos de acceso */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text flex items-center gap-2">
            🔐 Datos de acceso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-dim mb-1.5">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:border-primary focus:outline-none"
                placeholder="coach@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-text-dim mb-1.5">Contraseña *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:border-primary focus:outline-none"
                placeholder="Min 6 chars, 1 mayúscula, 1 número"
                required
                minLength={6}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-dim mb-1.5">Nombre completo *</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:border-primary focus:outline-none"
              placeholder="Nombre y apellido"
              required
            />
          </div>
        </div>

        {/* Organización */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text flex items-center gap-2">
            🏢 Organización
          </h2>
          <div>
            <label className="block text-xs text-text-dim mb-1.5">Asignar a organización</label>
            <select
              value={form.organizationId}
              onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:border-primary focus:outline-none"
            >
              <option value="">Sin asignar</option>
              {orgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.type === "independent_coach" ? "Coach independiente" : "Gym"})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Deportes */}
        {sports.length > 0 && (
          <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text flex items-center gap-2">
              🏋️ Deportes
            </h2>
            <div className="flex flex-wrap gap-2">
              {sports.map((sport) => (
                <button
                  key={sport.id}
                  type="button"
                  onClick={() => toggleSport(sport.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    form.sportIds.includes(sport.id)
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-bg border-border text-text-muted hover:border-primary/50"
                  }`}
                >
                  {sport.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info adicional */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text flex items-center gap-2">
            📋 Info adicional
          </h2>
          <div>
            <label className="block text-xs text-text-dim mb-1.5">Especialización</label>
            <input
              type="text"
              value={form.specialization}
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:border-primary focus:outline-none"
              placeholder="Ej: Musculación, Crossfit, Funcional..."
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Creando..." : "Crear coach"}
          </button>
        </div>
      </form>
    </div>
  );
}

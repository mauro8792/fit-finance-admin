"use client";

import { useEffect, useState } from "react";
import {
  Package,
  RefreshCw,
  Plus,
  X,
  Pencil,
  Users,
  UserCheck,
  DollarSign,
  Infinity,
  Sparkles,
} from "lucide-react";
import {
  getPlans,
  createPlan,
  updatePlan,
  seedPlans,
  planFeaturesToRecord,
  type SubscriptionPlanData,
} from "@/lib/api";
import { toast } from "sonner";

const PLAN_TYPE_OPTIONS = [
  { value: "trial", label: "Trial" },
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "gym", label: "Gym" },
  { value: "personal", label: "Personal" },
];

const FEATURE_OPTIONS = [
  { key: "routines", label: "Rutinas" },
  { key: "nutrition", label: "Nutrición" },
  { key: "progress", label: "Progreso" },
  { key: "payments", label: "Pagos/Cuotas" },
  { key: "multiCoach", label: "Multi-Coach" },
];

const emptyForm = {
  name: "",
  slug: "",
  type: "starter",
  maxStudents: "",
  maxCoaches: "",
  priceUsd: "0",
  priceArs: "0",
  durationDays: "",
  description: "",
  features: { routines: true, nutrition: true, progress: true, payments: true } as Record<string, boolean>,
};

export default function PlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanData | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    try {
      const data = await getPlans();
      setPlans(data);
    } catch {
      toast.error("Error cargando planes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingPlan(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (plan: SubscriptionPlanData) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      type: plan.type,
      maxStudents: plan.maxStudents !== null ? String(plan.maxStudents) : "",
      maxCoaches: plan.maxCoaches !== null ? String(plan.maxCoaches) : "",
      priceUsd: String(plan.priceUsd),
      priceArs: String(plan.priceArs),
      durationDays: plan.durationDays !== null ? String(plan.durationDays) : "",
      description: plan.description || "",
      features: planFeaturesToRecord(plan.features),
    });
    setShowModal(true);
  };

  const handleSeed = async () => {
    try {
      await seedPlans();
      toast.success("Planes base creados/verificados");
      loadData();
    } catch {
      toast.error("Error ejecutando seed de planes");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.type) {
      toast.error("Completá nombre, slug y tipo");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        slug: form.slug,
        type: form.type,
        maxStudents: form.maxStudents ? Number(form.maxStudents) : null,
        maxCoaches: form.maxCoaches ? Number(form.maxCoaches) : null,
        priceUsd: Number(form.priceUsd) || 0,
        priceArs: Number(form.priceArs) || 0,
        durationDays: form.durationDays ? Number(form.durationDays) : null,
        description: form.description || null,
        features: form.features,
      };

      if (editingPlan) {
        await updatePlan(editingPlan.id, payload);
        toast.success(`Plan "${form.name}" actualizado`);
      } else {
        await createPlan(payload);
        toast.success(`Plan "${form.name}" creado`);
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error guardando plan");
    } finally {
      setSaving(false);
    }
  };

  const toggleFeature = (key: string) => {
    setForm((prev) => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Planes</h1>
          <p className="text-sm text-text-muted mt-1">
            Gestión de planes de suscripción y sus límites
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeed}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text-muted hover:text-text transition-colors"
            title="Crear planes base si no existen"
          >
            <Sparkles className="w-4 h-4" />
            Seed
          </button>
          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-surface border border-border text-text-muted hover:text-text transition-colors"
            title="Refrescar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo plan
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <Package className="w-10 h-10 text-text-dim mx-auto mb-3" />
          <p className="text-sm text-text-muted mb-4">
            No hay planes creados
          </p>
          <button
            onClick={handleSeed}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Crear planes base
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const features = planFeaturesToRecord(plan.features);
            return (
              <div
                key={plan.id}
                className="bg-surface rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-colors"
              >
                {/* Plan Header */}
                <div className="px-5 py-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-text">
                        {plan.name}
                      </h3>
                      <span className="text-[10px] font-medium text-text-dim uppercase tracking-wider">
                        {plan.type} · {plan.slug}
                      </span>
                    </div>
                    <button
                      onClick={() => openEdit(plan)}
                      className="p-2 rounded-lg text-text-dim hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Editar plan"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Plan Body */}
                <div className="px-5 py-4 space-y-3">
                  {/* Precio */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-success" />
                    <span className="text-sm text-text">
                      {Number(plan.priceUsd) === 0 ? (
                        <span className="text-success font-medium">Gratis</span>
                      ) : (
                        <>
                          <span className="font-semibold">
                            USD ${Number(plan.priceUsd).toFixed(0)}
                          </span>
                          <span className="text-text-muted">
                            {" "}/ ARS ${Number(plan.priceArs).toLocaleString()}
                          </span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Límites */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-text-dim" />
                      <span className="text-xs text-text-muted">Alumnos:</span>
                      <span className="text-xs font-medium text-text">
                        {plan.maxStudents !== null ? plan.maxStudents : (
                          <Infinity className="w-3.5 h-3.5 inline text-primary" />
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-text-dim" />
                      <span className="text-xs text-text-muted">Coaches:</span>
                      <span className="text-xs font-medium text-text">
                        {plan.maxCoaches !== null ? plan.maxCoaches : (
                          <Infinity className="w-3.5 h-3.5 inline text-primary" />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Duración */}
                  {plan.durationDays && (
                    <p className="text-xs text-text-muted">
                      Duración: {plan.durationDays} días
                    </p>
                  )}

                  {/* Descripción */}
                  {plan.description && (
                    <p className="text-xs text-text-muted italic">
                      {plan.description}
                    </p>
                  )}

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {FEATURE_OPTIONS.map((f) => (
                      <span
                        key={f.key}
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          features[f.key]
                            ? "bg-success/20 text-success"
                            : "bg-border text-text-dim"
                        }`}
                      >
                        {f.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear/Editar Plan */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl border border-border w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
              <h2 className="text-lg font-semibold text-text">
                {editingPlan ? `Editar plan: ${editingPlan.name}` : "Nuevo plan"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md text-text-dim hover:text-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nombre y Slug */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Pro"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">
                    Slug (único) *
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
                    }
                    placeholder="pro"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                  />
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Tipo *
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                >
                  {PLAN_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Límites */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">
                    Max. alumnos
                    <span className="text-text-dim ml-1">(vacío = ilimitado)</span>
                  </label>
                  <input
                    type="number"
                    value={form.maxStudents}
                    onChange={(e) =>
                      setForm({ ...form, maxStudents: e.target.value })
                    }
                    placeholder="Ilimitado"
                    min="0"
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">
                    Max. coaches
                    <span className="text-text-dim ml-1">(vacío = ilimitado)</span>
                  </label>
                  <input
                    type="number"
                    value={form.maxCoaches}
                    onChange={(e) =>
                      setForm({ ...form, maxCoaches: e.target.value })
                    }
                    placeholder="Ilimitado"
                    min="0"
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                  />
                </div>
              </div>

              {/* Precios */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">
                    Precio USD
                  </label>
                  <input
                    type="number"
                    value={form.priceUsd}
                    onChange={(e) =>
                      setForm({ ...form, priceUsd: e.target.value })
                    }
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">
                    Precio ARS
                  </label>
                  <input
                    type="number"
                    value={form.priceArs}
                    onChange={(e) =>
                      setForm({ ...form, priceArs: e.target.value })
                    }
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                  />
                </div>
              </div>

              {/* Duración */}
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Duración en días
                  <span className="text-text-dim ml-1">(vacío = recurrente mensual)</span>
                </label>
                <input
                  type="number"
                  value={form.durationDays}
                  onChange={(e) =>
                    setForm({ ...form, durationDays: e.target.value })
                  }
                  placeholder="Mensual recurrente"
                  min="1"
                  className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Descripción visible para el cliente..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text placeholder:text-text-dim resize-none"
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">
                  Features incluidas
                </label>
                <div className="flex flex-wrap gap-2">
                  {FEATURE_OPTIONS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => toggleFeature(f.key)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                        form.features[f.key]
                          ? "bg-success/20 border-success/30 text-success"
                          : "bg-bg border-border text-text-dim hover:text-text"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-text-muted hover:text-text transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving
                    ? "Guardando..."
                    : editingPlan
                    ? "Guardar cambios"
                    : "Crear plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

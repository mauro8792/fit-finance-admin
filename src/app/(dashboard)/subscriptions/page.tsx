"use client";

import { Fragment, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Plus,
  X,
  DollarSign,
  AlertTriangle,
  Clock,
  Receipt,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import {
  getSubscriptions,
  getOrganizations,
  getPlans,
  updateSubscription,
  createSubscription,
  createSubscriptionPayment,
  getSubscriptionPayments,
  type SubscriptionData,
  type OrganizationData,
  type SubscriptionPlanData,
  type SubscriptionPaymentData,
} from "@/lib/api";
import { toast } from "sonner";

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function BillingBadge({ days }: { days: number | null }) {
  if (days === null) return <span className="text-xs text-text-dim">—</span>;
  if (days < 0)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-error/20 text-error">
        <AlertTriangle className="w-3 h-3" />
        Vencido hace {Math.abs(days)}d
      </span>
    );
  if (days <= 3)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-error/20 text-error">
        <Clock className="w-3 h-3" />
        {days === 0 ? "Vence hoy" : `Vence en ${days}d`}
      </span>
    );
  if (days <= 7)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-warning/20 text-warning">
        <Clock className="w-3 h-3" />
        {days}d
      </span>
    );
  return <span className="text-xs text-text-muted">{days}d</span>;
}

const PAYMENT_METHODS = [
  { value: "transfer", label: "Transferencia" },
  { value: "mercadopago", label: "MercadoPago" },
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "other", label: "Otro" },
];

export default function SubscriptionsPage() {
  const searchParams = useSearchParams();
  const orgFilter = searchParams.get("org");

  const [subs, setSubs] = useState<SubscriptionData[]>([]);
  const [orgs, setOrgs] = useState<OrganizationData[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal crear suscripción
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSub, setNewSub] = useState({
    organizationId: "",
    planId: "",
    status: "active",
    startDate: new Date().toISOString().split("T")[0],
    nextBillingDate: "",
    trialEndsAt: "",
    notes: "",
  });

  // Modal registrar pago
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSub, setPaymentSub] = useState<SubscriptionData | null>(null);
  const [payingLoading, setPayingLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    currency: "ARS",
    method: "transfer",
    paymentDate: new Date().toISOString().split("T")[0],
    periodStart: "",
    periodEnd: "",
    notes: "",
  });

  // Historial de pagos
  const [expandedSub, setExpandedSub] = useState<number | null>(null);
  const [payments, setPayments] = useState<SubscriptionPaymentData[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const loadData = async () => {
    try {
      const [subsData, orgsData, plansData] = await Promise.all([
        getSubscriptions(),
        getOrganizations(),
        getPlans(),
      ]);
      setSubs(subsData);
      setOrgs(orgsData);
      setPlans(plansData);
    } catch {
      toast.error("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (sub: SubscriptionData, newStatus: string) => {
    try {
      await updateSubscription(sub.id, { status: newStatus as any });
      toast.success(`Suscripción #${sub.id} actualizada a ${newStatus}`);
      loadData();
    } catch {
      toast.error("Error actualizando suscripción");
    }
  };

  const handlePlanChange = async (sub: SubscriptionData, newPlanId: number) => {
    try {
      await updateSubscription(sub.id, { planId: newPlanId } as any);
      toast.success("Plan actualizado");
      loadData();
    } catch {
      toast.error("Error cambiando plan");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.organizationId || !newSub.planId) {
      toast.error("Seleccioná una organización y un plan");
      return;
    }
    setCreating(true);
    try {
      await createSubscription({
        organizationId: Number(newSub.organizationId),
        planId: Number(newSub.planId),
        status: newSub.status as any,
        startDate: newSub.startDate,
        nextBillingDate: newSub.nextBillingDate || undefined,
        trialEndsAt: newSub.trialEndsAt || undefined,
        notes: newSub.notes || undefined,
      } as any);
      toast.success("Suscripción creada exitosamente");
      setShowCreate(false);
      setNewSub({
        organizationId: "",
        planId: "",
        status: "active",
        startDate: new Date().toISOString().split("T")[0],
        nextBillingDate: "",
        trialEndsAt: "",
        notes: "",
      });
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error creando suscripción");
    } finally {
      setCreating(false);
    }
  };

  const openPaymentModal = (sub: SubscriptionData) => {
    setPaymentSub(sub);
    const today = new Date().toISOString().split("T")[0];
    // Pre-llenar período: desde hoy hasta +30 días
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);
    setPaymentForm({
      amount: "",
      currency: "ARS",
      method: "transfer",
      paymentDate: today,
      periodStart: today,
      periodEnd: periodEnd.toISOString().split("T")[0],
      notes: "",
    });
    setShowPayment(true);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentSub || !paymentForm.amount) {
      toast.error("Completá el monto");
      return;
    }
    setPayingLoading(true);
    try {
      await createSubscriptionPayment({
        subscriptionId: paymentSub.id,
        amount: Number(paymentForm.amount),
        currency: paymentForm.currency,
        method: paymentForm.method as any,
        paymentDate: paymentForm.paymentDate,
        periodStart: paymentForm.periodStart || undefined,
        periodEnd: paymentForm.periodEnd || undefined,
        notes: paymentForm.notes || undefined,
      } as any);
      toast.success("Pago registrado exitosamente");
      setShowPayment(false);
      loadData();
      // Si el historial está expandido para esta sub, refrescarlo
      if (expandedSub === paymentSub.id) {
        loadPayments(paymentSub.id);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error registrando pago");
    } finally {
      setPayingLoading(false);
    }
  };

  const loadPayments = async (subId: number) => {
    setLoadingPayments(true);
    try {
      const data = await getSubscriptionPayments(subId);
      setPayments(data);
    } catch {
      toast.error("Error cargando pagos");
    } finally {
      setLoadingPayments(false);
    }
  };

  const togglePaymentHistory = (subId: number) => {
    if (expandedSub === subId) {
      setExpandedSub(null);
    } else {
      setExpandedSub(subId);
      loadPayments(subId);
    }
  };

  const handleNextBillingChange = async (sub: SubscriptionData, date: string) => {
    try {
      await updateSubscription(sub.id, { nextBillingDate: date } as any);
      toast.success("Fecha de próximo cobro actualizada");
      loadData();
    } catch {
      toast.error("Error actualizando fecha");
    }
  };

  const filtered = subs.filter((sub) => {
    const org = orgs.find((o) => o.id === sub.organizationId);
    const matchesSearch =
      !search ||
      org?.name.toLowerCase().includes(search.toLowerCase()) ||
      String(sub.id).includes(search);
    const matchesStatus = filterStatus === "all" || sub.status === filterStatus;
    const matchesOrg = !orgFilter || sub.organizationId === Number(orgFilter);
    return matchesSearch && matchesStatus && matchesOrg;
  });

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
          <h1 className="text-2xl font-bold text-text">Suscripciones</h1>
          <p className="text-sm text-text-muted mt-1">
            Gestión de planes, cobros y suscripciones de organizaciones
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva suscripción
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por organización..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface border border-border text-sm text-text placeholder:text-text-dim"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="trial">Trial</option>
          <option value="expired">Expirada</option>
          <option value="suspended">Suspendida</option>
          <option value="cancelled">Cancelada</option>
        </select>
        <button
          onClick={loadData}
          className="p-2 rounded-lg bg-surface border border-border text-text-muted hover:text-text transition-colors"
          title="Refrescar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-10 h-10 text-text-dim mx-auto mb-3" />
            <p className="text-sm text-text-muted">No se encontraron suscripciones</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[11px] font-medium text-text-dim uppercase tracking-wider px-4 py-3">#</th>
                <th className="text-left text-[11px] font-medium text-text-dim uppercase tracking-wider px-4 py-3">Organización</th>
                <th className="text-left text-[11px] font-medium text-text-dim uppercase tracking-wider px-4 py-3">Plan</th>
                <th className="text-left text-[11px] font-medium text-text-dim uppercase tracking-wider px-4 py-3">Estado</th>
                <th className="text-left text-[11px] font-medium text-text-dim uppercase tracking-wider px-4 py-3">Inicio</th>
                <th className="text-left text-[11px] font-medium text-text-dim uppercase tracking-wider px-4 py-3">Próx. cobro</th>
                <th className="text-right text-[11px] font-medium text-text-dim uppercase tracking-wider px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((sub) => {
                const org = orgs.find((o) => o.id === sub.organizationId);
                const billingDays = daysUntil(sub.nextBillingDate);
                const isExpanded = expandedSub === sub.id;
                return (
                  <Fragment key={sub.id}>
                    <tr className="hover:bg-surface-hover transition-colors">
                      <td className="px-4 py-3 text-xs text-text-dim">#{sub.id}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-text">
                          {org?.name || `Org #${sub.organizationId}`}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={sub.planId}
                          onChange={(e) => handlePlanChange(sub, Number(e.target.value))}
                          className="px-2 py-1 rounded bg-bg border border-border text-xs text-text"
                        >
                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-text-muted">
                        {new Date(sub.startDate).toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={sub.nextBillingDate?.split("T")[0] || ""}
                            onChange={(e) => handleNextBillingChange(sub, e.target.value)}
                            className="px-1.5 py-0.5 rounded bg-bg border border-border text-[11px] text-text w-[120px]"
                          />
                          <BillingBadge days={billingDays} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* Registrar pago */}
                          <button
                            onClick={() => openPaymentModal(sub)}
                            className="p-1.5 rounded-md text-text-dim hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Registrar pago"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                          {/* Ver pagos */}
                          <button
                            onClick={() => togglePaymentHistory(sub.id)}
                            className={`p-1.5 rounded-md transition-colors ${
                              isExpanded
                                ? "text-primary bg-primary/10"
                                : "text-text-dim hover:text-primary hover:bg-primary/10"
                            }`}
                            title="Historial de pagos"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                          {/* Status actions */}
                          {(sub.status === "trial" || sub.status === "expired" || sub.status === "suspended") && (
                            <button
                              onClick={() => handleStatusChange(sub, "active")}
                              className="p-1.5 rounded-md text-text-dim hover:text-success hover:bg-success-light transition-colors"
                              title="Activar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {sub.status === "active" && (
                            <button
                              onClick={() => handleStatusChange(sub, "suspended")}
                              className="p-1.5 rounded-md text-text-dim hover:text-warning hover:bg-warning-light transition-colors"
                              title="Suspender"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          )}
                          {sub.status === "suspended" && (
                            <button
                              onClick={() => handleStatusChange(sub, "active")}
                              className="p-1.5 rounded-md text-text-dim hover:text-success hover:bg-success-light transition-colors"
                              title="Reactivar"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {sub.status !== "cancelled" && (
                            <button
                              onClick={() => handleStatusChange(sub, "cancelled")}
                              className="p-1.5 rounded-md text-text-dim hover:text-error hover:bg-error-light transition-colors"
                              title="Cancelar"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* Payment History Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="px-4 py-3 bg-bg/50">
                          <div className="ml-6">
                            <h4 className="text-xs font-medium text-text-muted mb-2 flex items-center gap-1.5">
                              <Receipt className="w-3.5 h-3.5" />
                              Historial de pagos
                            </h4>
                            {loadingPayments ? (
                              <div className="flex items-center gap-2 py-2">
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs text-text-dim">Cargando...</span>
                              </div>
                            ) : payments.length === 0 ? (
                              <p className="text-xs text-text-dim py-2">
                                Sin pagos registrados.{" "}
                                <button
                                  onClick={() => openPaymentModal(sub)}
                                  className="text-primary hover:underline"
                                >
                                  Registrar primer pago
                                </button>
                              </p>
                            ) : (
                              <div className="space-y-1">
                                {payments.map((p) => (
                                  <div
                                    key={p.id}
                                    className="flex items-center gap-4 text-xs py-1.5 px-3 rounded-lg bg-surface border border-border/50"
                                  >
                                    <span className="text-text-muted w-20">
                                      {new Date(p.paymentDate).toLocaleDateString("es-AR")}
                                    </span>
                                    <span className="font-medium text-text">
                                      {p.currency} ${Number(p.amount).toLocaleString()}
                                    </span>
                                    <span className="text-text-dim capitalize">
                                      {PAYMENT_METHODS.find((m) => m.value === p.method)?.label || p.method}
                                    </span>
                                    {p.periodStart && p.periodEnd && (
                                      <span className="text-text-dim">
                                        Período: {new Date(p.periodStart).toLocaleDateString("es-AR")} - {new Date(p.periodEnd).toLocaleDateString("es-AR")}
                                      </span>
                                    )}
                                    {p.notes && (
                                      <span className="text-text-dim italic truncate max-w-[200px]">
                                        {p.notes}
                                      </span>
                                    )}
                                    <span className="text-text-dim ml-auto">
                                      por {p.registeredBy}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Crear Suscripción */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl border border-border w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-text">Nueva suscripción</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-md text-text-dim hover:text-text transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Organización *</label>
                <select
                  value={newSub.organizationId}
                  onChange={(e) => setNewSub({ ...newSub, organizationId: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                >
                  <option value="">Seleccionar organización...</option>
                  {orgs.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Plan *</label>
                <select
                  value={newSub.planId}
                  onChange={(e) => setNewSub({ ...newSub, planId: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                >
                  <option value="">Seleccionar plan...</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.maxStudents ?? "ilimitados"} alumnos
                      {Number(p.priceUsd) > 0 ? ` — USD $${p.priceUsd}` : " — Gratis"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Estado</label>
                <select
                  value={newSub.status}
                  onChange={(e) => setNewSub({ ...newSub, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                >
                  <option value="active">Activa</option>
                  <option value="trial">Trial</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Fecha de inicio *</label>
                  <input
                    type="date"
                    value={newSub.startDate}
                    onChange={(e) => setNewSub({ ...newSub, startDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Próximo cobro</label>
                  <input
                    type="date"
                    value={newSub.nextBillingDate}
                    onChange={(e) => setNewSub({ ...newSub, nextBillingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                  />
                </div>
              </div>
              {newSub.status === "trial" && (
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Trial hasta</label>
                  <input
                    type="date"
                    value={newSub.trialEndsAt}
                    onChange={(e) => setNewSub({ ...newSub, trialEndsAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Notas (opcional)</label>
                <textarea
                  value={newSub.notes}
                  onChange={(e) => setNewSub({ ...newSub, notes: e.target.value })}
                  placeholder="Notas internas..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text placeholder:text-text-dim resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm text-text-muted hover:text-text transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={creating} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {creating ? "Creando..." : "Crear suscripción"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Pago */}
      {showPayment && paymentSub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl border border-border w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold text-text">Registrar pago</h2>
                <p className="text-xs text-text-muted">
                  {orgs.find((o) => o.id === paymentSub.organizationId)?.name || `Sub #${paymentSub.id}`}
                  {" · "}
                  {plans.find((p) => p.id === paymentSub.planId)?.name || ""}
                </p>
              </div>
              <button onClick={() => setShowPayment(false)} className="p-1 rounded-md text-text-dim hover:text-text transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePayment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Monto *</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Moneda</label>
                  <select
                    value={paymentForm.currency}
                    onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                  >
                    <option value="ARS">ARS</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Método</label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Fecha de pago *</label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Período desde</label>
                  <input
                    type="date"
                    value={paymentForm.periodStart}
                    onChange={(e) => setPaymentForm({ ...paymentForm, periodStart: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Período hasta</label>
                  <input
                    type="date"
                    value={paymentForm.periodEnd}
                    onChange={(e) => setPaymentForm({ ...paymentForm, periodEnd: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Notas</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Ej: Transferencia BBV, comprobante #1234..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text placeholder:text-text-dim resize-none"
                />
              </div>
              <div className="bg-bg/50 rounded-lg p-3 text-xs text-text-muted">
                <p>Al registrar el pago con un período, la fecha de "Próximo cobro" se actualizará automáticamente al día siguiente del fin del período.</p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowPayment(false)} className="px-4 py-2 rounded-lg text-sm text-text-muted hover:text-text transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={payingLoading} className="px-4 py-2 rounded-lg bg-success text-white text-sm font-medium hover:bg-success/90 transition-colors disabled:opacity-50">
                  {payingLoading ? "Registrando..." : "Registrar pago"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Eye,
  Power,
  Users,
  UserCheck,
  ShieldCheck,
  X,
  Loader2,
} from "lucide-react";
import { StatusBadge, OrgTypeBadge } from "@/components/ui/Badge";
import {
  getOrganizations,
  getSubscriptions,
  updateOrganization,
  createOrgAdmin,
  getOrgAdmins,
  type OrganizationData,
  type SubscriptionData,
  type OrgAdminData,
} from "@/lib/api";
import { toast } from "sonner";

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<OrganizationData[]>([]);
  const [subs, setSubs] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Modal de org-admins
  const [adminModal, setAdminModal] = useState<{ orgId: number; orgName: string } | null>(null);
  const [orgAdmins, setOrgAdmins] = useState<OrgAdminData[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", fullName: "" });

  const loadData = async () => {
    try {
      const [orgsData, subsData] = await Promise.all([
        getOrganizations(),
        getSubscriptions(),
      ]);
      setOrgs(orgsData);
      setSubs(subsData);
    } catch {
      toast.error("Error cargando organizaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleActive = async (org: OrganizationData) => {
    try {
      await updateOrganization(org.id, { isActive: !org.isActive });
      toast.success(
        org.isActive
          ? `${org.name} desactivada`
          : `${org.name} activada`
      );
      loadData();
    } catch {
      toast.error("Error actualizando organización");
    }
  };

  const openAdminModal = async (org: OrganizationData) => {
    setAdminModal({ orgId: org.id, orgName: org.name });
    setShowCreateAdmin(false);
    setNewAdmin({ email: "", password: "", fullName: "" });
    setLoadingAdmins(true);
    try {
      const admins = await getOrgAdmins(org.id);
      setOrgAdmins(admins);
    } catch {
      toast.error("Error cargando admins");
      setOrgAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!adminModal) return;
    if (!newAdmin.email || !newAdmin.password || !newAdmin.fullName) {
      toast.error("Completá todos los campos");
      return;
    }
    try {
      setCreatingAdmin(true);
      await createOrgAdmin(adminModal.orgId, newAdmin);
      toast.success("Admin creado exitosamente");
      setShowCreateAdmin(false);
      setNewAdmin({ email: "", password: "", fullName: "" });
      // Recargar admins
      const admins = await getOrgAdmins(adminModal.orgId);
      setOrgAdmins(admins);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error creando admin";
      toast.error(msg);
    } finally {
      setCreatingAdmin(false);
    }
  };

  const filtered = orgs.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.slug.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || org.type === filterType;
    return matchesSearch && matchesType;
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
          <h1 className="text-2xl font-bold text-text">Organizaciones</h1>
          <p className="text-sm text-text-muted mt-1">
            Gestión de gyms y coaches independientes
          </p>
        </div>
        <Link
          href="/organizations/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva organización
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o slug..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface border border-border text-sm text-text placeholder:text-text-dim"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text"
        >
          <option value="all">Todos los tipos</option>
          <option value="independent_coach">Coach</option>
          <option value="gym">Gym</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-10 h-10 text-text-dim mx-auto mb-3" />
            <p className="text-sm text-text-muted">No se encontraron organizaciones</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[11px] font-medium text-text-dim uppercase tracking-wider px-5 py-3">
                  Organización
                </th>
                <th className="text-left text-[11px] font-medium text-text-dim uppercase tracking-wider px-5 py-3">
                  Tipo
                </th>
                <th className="text-left text-[11px] font-medium text-text-dim uppercase tracking-wider px-5 py-3">
                  Suscripción
                </th>
                <th className="text-left text-[11px] font-medium text-text-dim uppercase tracking-wider px-5 py-3">
                  Estado
                </th>
                <th className="text-left text-[11px] font-medium text-text-dim uppercase tracking-wider px-5 py-3">
                  Creada
                </th>
                <th className="text-right text-[11px] font-medium text-text-dim uppercase tracking-wider px-5 py-3">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((org) => {
                const sub = subs.find(
                  (s) =>
                    s.organizationId === org.id &&
                    (s.status === "active" || s.status === "trial")
                );
                return (
                  <tr
                    key={org.id}
                    className="hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{
                            backgroundColor: org.primaryColor || "#6366f1",
                          }}
                        >
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">
                            {org.name}
                          </p>
                          <p className="text-[10px] text-text-dim">
                            {org.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <OrgTypeBadge type={org.type} />
                    </td>
                    <td className="px-5 py-3">
                      {sub ? (
                        <div>
                          <StatusBadge status={sub.status} />
                          <p className="text-[10px] text-text-dim mt-0.5">
                            {sub.plan?.name || `Plan #${sub.planId}`}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-text-dim">Sin plan</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs ${
                          org.isActive ? "text-success" : "text-error"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            org.isActive ? "bg-success" : "bg-error"
                          }`}
                        />
                        {org.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-text-muted">
                        {new Date(org.createdAt).toLocaleDateString("es-AR")}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openAdminModal(org)}
                          className="p-1.5 rounded-md text-text-dim hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                          title="Gestionar admins"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/organizations/${org.id}`}
                          className="p-1.5 rounded-md text-text-dim hover:text-text hover:bg-surface transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/organizations/${org.id}/edit`}
                          className="p-1.5 rounded-md text-text-dim hover:text-primary hover:bg-primary-light transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => toggleActive(org)}
                          className={`p-1.5 rounded-md transition-colors ${
                            org.isActive
                              ? "text-text-dim hover:text-error hover:bg-error-light"
                              : "text-text-dim hover:text-success hover:bg-success-light"
                          }`}
                          title={
                            org.isActive ? "Desactivar" : "Activar"
                          }
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Org-Admins */}
      {adminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl border border-border w-full max-w-lg max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold text-text">
                  Admins de {adminModal.orgName}
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Usuarios que pueden gestionar esta organización desde la PWA
                </p>
              </div>
              <button
                onClick={() => setAdminModal(null)}
                className="p-1.5 rounded-md text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Lista de admins existentes */}
              {loadingAdmins ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : orgAdmins.length === 0 ? (
                <div className="text-center py-6">
                  <ShieldCheck className="w-8 h-8 text-text-dim mx-auto mb-2" />
                  <p className="text-sm text-text-muted">
                    Esta organización no tiene admins asignados
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orgAdmins.map((admin) => (
                    <div
                      key={admin.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                    >
                      <div>
                        <p className="text-sm font-medium text-text">{admin.fullName}</p>
                        <p className="text-xs text-text-muted">{admin.email}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-medium">
                        Admin
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario crear admin */}
              {showCreateAdmin ? (
                <div className="space-y-3 p-4 rounded-lg bg-background border border-border">
                  <h3 className="text-sm font-medium text-text">Nuevo admin</h3>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={newAdmin.fullName}
                    onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text placeholder:text-text-dim"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text placeholder:text-text-dim"
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text placeholder:text-text-dim"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleCreateAdmin}
                      disabled={creatingAdmin}
                      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {creatingAdmin ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                      Crear admin
                    </button>
                    <button
                      onClick={() => setShowCreateAdmin(false)}
                      className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateAdmin(true)}
                  className="flex items-center gap-2 px-4 py-2 w-full justify-center bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar admin
                </button>
              )}

              {/* Info */}
              <div className="text-xs text-text-dim bg-background rounded-lg p-3 border border-border">
                <p>
                  <strong>Nota:</strong> El admin podrá iniciar sesión en la PWA con la URL de la
                  organización (ej: <code>?org={orgs.find(o => o.id === adminModal.orgId)?.slug}</code>)
                  y gestionar coaches, alumnos y cuotas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

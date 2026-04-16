"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, Edit, Power, Users, Dumbbell } from "lucide-react";
import { getCoaches, getOrganizations, toggleCoachActive, type CoachData, type OrganizationData } from "@/lib/api";
import { toast } from "sonner";

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<CoachData[]>([]);
  const [orgs, setOrgs] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [coachesData, orgsData] = await Promise.all([
        getCoaches(),
        getOrganizations(),
      ]);
      setCoaches(coachesData);
      setOrgs(orgsData);
    } catch {
      toast.error("Error cargando coaches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getOrgName = (orgId: number | null) => {
    if (!orgId) return null;
    return orgs.find(o => o.id === orgId);
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleCoachActive(id);
      toast.success("Estado actualizado");
      load();
    } catch {
      toast.error("Error actualizando estado");
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Coaches</h1>
          <p className="text-sm text-text-muted mt-0.5">Gestión de coaches por organización</p>
        </div>
        <Link
          href="/coaches/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo coach
        </Link>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-text-dim uppercase tracking-wider">Coach</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-text-dim uppercase tracking-wider">Organización</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-text-dim uppercase tracking-wider">Deportes</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-text-dim uppercase tracking-wider">Alumnos</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-text-dim uppercase tracking-wider">Estado</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-text-dim uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coaches.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-sm text-text-muted">
                  No hay coaches registrados
                </td>
              </tr>
            ) : (
              coaches.map((coach) => {
                const org = getOrgName(coach.organizationId);
                return (
                  <tr key={coach.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                          {coach.user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">{coach.user.fullName}</p>
                          <p className="text-xs text-text-dim">{coach.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {org ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ backgroundColor: org.primaryColor || "#6366f1" }}
                          >
                            {org.name.charAt(0)}
                          </div>
                          <span className="text-sm text-text">{org.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-text-dim">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {coach.sports?.length > 0 ? (
                          coach.sports.map(s => (
                            <span key={s.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full">
                              <Dumbbell className="w-3 h-3" />
                              {s.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-text-dim">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-text-dim" />
                        <span className="text-sm text-text">{coach.students?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${
                        coach.isActive
                          ? "bg-success/10 text-success"
                          : "bg-error/10 text-error"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${coach.isActive ? "bg-success" : "bg-error"}`} />
                        {coach.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/coaches/${coach.id}`}
                          className="p-1.5 rounded-md text-text-dim hover:text-text hover:bg-surface transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/coaches/${coach.id}/edit`}
                          className="p-1.5 rounded-md text-text-dim hover:text-text hover:bg-surface transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleActive(coach.id)}
                          className={`p-1.5 rounded-md transition-colors ${
                            coach.isActive
                              ? "text-text-dim hover:text-error hover:bg-error/10"
                              : "text-text-dim hover:text-success hover:bg-success/10"
                          }`}
                          title={coach.isActive ? "Desactivar" : "Activar"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

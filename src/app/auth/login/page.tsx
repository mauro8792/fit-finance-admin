"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Eye, EyeOff, AlertCircle } from "lucide-react";
import { loginAdmin } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setAuth, isAuthenticated, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/overview");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginAdmin(email, password);

      // La respuesta es plana: { id, email, fullName, roles, token, ... }
      const roles = data.roles || data.user?.roles || [];
      const isAdmin = roles.some(
        (r: { name: string }) =>
          r.name === "admin" || r.name === "super-admin" || r.name === "super-user"
      );

      if (!isAdmin) {
        setError("No tenés permisos de administrador.");
        setLoading(false);
        return;
      }

      const user = data.user || { id: data.id, email: data.email, fullName: data.fullName, roles };
      setAuth(user, data.token);
      router.push("/overview");
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Error al iniciar sesión";
      setError(typeof message === "string" ? message : message[0] || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-text">Fit Finance Admin</h1>
          <p className="text-sm text-text-muted mt-1">
            Panel de administración
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-error-light text-error text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fitfinance.com"
              className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-sm text-text placeholder:text-text-dim focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-medium">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-sm text-text placeholder:text-text-dim pr-10 focus:border-primary transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Ingresando...
              </span>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-text-dim mt-8">
          Solo administradores autorizados
        </p>
      </div>
    </div>
  );
}

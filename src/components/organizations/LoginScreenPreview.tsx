"use client";

import type { LoginHeroScale } from "@/lib/api";

function previewHeroClass(scale: LoginHeroScale | undefined): string {
  const base = "block w-auto max-w-full object-contain object-center mx-auto drop-shadow-2xl";
  switch (scale) {
    case "compact":
      return `${base} max-h-[40px] max-w-[100px]`;
    case "comfortable":
      return `${base} max-h-[78px] max-w-[195px]`;
    case "default":
    default:
      return `${base} max-h-[60px] max-w-[150px]`;
  }
}

/**
 * Miniatura del login real de la PWA (mismos colores que `fit-finance-ui-3` /auth/login).
 * Sirve para validar logo vs imagen específica de login antes de publicar.
 */
export function LoginScreenPreview({
  orgName,
  logoUrl,
  loginImageUrl,
  loginHeroScale,
  footerText,
}: {
  orgName: string;
  logoUrl?: string;
  loginImageUrl?: string;
  loginHeroScale?: LoginHeroScale;
  footerText?: string;
}) {
  const hero =
    (typeof loginImageUrl === "string" && loginImageUrl.trim().startsWith("http")
      ? loginImageUrl.trim()
      : null) ||
    (typeof logoUrl === "string" && logoUrl.trim().startsWith("http")
      ? logoUrl.trim()
      : null);

  const initial = orgName?.trim()?.charAt(0)?.toUpperCase() || "?";
  const year = new Date().getFullYear();
  const footer =
    footerText?.trim() ||
    `© ${year} ${orgName || "Organización"}. Todos los derechos reservados.`;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <p className="text-[11px] text-text-muted px-3 py-2 border-b border-border bg-bg/80">
        Vista previa — pantalla de login (como la verán en la app)
      </p>
      <div className="relative flex flex-col items-center justify-center p-4 min-h-[260px] bg-gradient-to-b from-[#2d3748] to-[#1a202c] text-white">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff9800]/30 to-transparent pointer-events-none" />

        <div className="w-full max-w-[240px] relative z-[1] flex flex-col items-center">
          <div className="flex flex-col items-center mb-4 min-h-[72px] justify-center">
            {hero ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hero}
                alt={orgName || "Logo"}
                className={previewHeroClass(loginHeroScale)}
              />
            ) : (
              <div className="h-[72px] w-[72px] rounded-full bg-[#ff9800]/90 flex items-center justify-center text-2xl font-bold text-black shadow-lg">
                {initial}
              </div>
            )}
          </div>

          <div className="w-full rounded-2xl border border-[#ff9800]/30 bg-[#1a202c]/80 backdrop-blur-xl p-3 shadow-2xl space-y-2">
            <div className="space-y-1">
              <p className="text-[8px] uppercase tracking-wider text-gray-400">
                Correo electrónico
              </p>
              <div className="h-8 rounded-xl bg-[#2d3748]/80 border border-white/5" />
            </div>
            <div className="space-y-1">
              <p className="text-[8px] uppercase tracking-wider text-gray-400">
                Contraseña
              </p>
              <div className="h-8 rounded-xl bg-[#2d3748]/80 border border-white/5" />
            </div>
            <div className="h-7 rounded-xl bg-gradient-to-r from-[#ff9800] to-[#f57c00] text-black font-bold text-[9px] tracking-widest flex items-center justify-center uppercase">
              Ingresar
            </div>
          </div>

          <p className="text-center text-gray-500 text-[8px] mt-3 leading-snug px-1">
            {footer}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, Info, Smartphone } from "lucide-react";
import { toast } from "sonner";

const PWA_DOMAIN = process.env.NEXT_PUBLIC_PWA_DOMAIN || "bracamp.vercel.app";

function getBaseOrigin(): string {
  const parts = PWA_DOMAIN.split(".");
  // bracamp.vercel.app → vercel.app
  // bracamp.fitfinance.app → fitfinance.app
  if (parts.length >= 3) return parts.slice(1).join(".");
  return PWA_DOMAIN;
}

interface PwaIconGuideProps {
  slug: string;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`URL copiada: ${label}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1 rounded hover:bg-surface-hover transition-colors text-text-dim hover:text-text"
      title={`Copiar URL ${label}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

export default function PwaIconGuide({ slug }: PwaIconGuideProps) {
  const baseOrigin = getBaseOrigin();
  const prodUrl = slug ? `https://${slug}.${baseOrigin}` : null;
  const devUrl = slug ? `http://localhost:3001/auth/login?org=${slug}` : null;

  return (
    <div className="space-y-3">
      {/* Requisitos del ícono */}
      <div className="flex gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-text-muted space-y-1">
          <p className="font-medium text-text">Requisitos del ícono para la PWA</p>
          <ul className="list-disc list-inside space-y-0.5 text-text-dim">
            <li>Formato: PNG, JPG o WEBP (PNG recomendado)</li>
            <li>Tamaño mínimo: <span className="text-text">512×512px</span> para logos; <span className="text-text">192×192</span> y <span className="text-text">512×512</span> para iconos PWA (más abajo)</li>
            <li>Proporción: <span className="text-text">cuadrado (1:1)</span></li>
            <li>Podés subir todo desde esta pantalla (Cloudinary); los enlaces externos son opcionales</li>
          </ul>
          <div className="flex items-center gap-3 pt-1">
            <a
              href="https://maskable.app/editor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:text-primary-hover transition-colors"
            >
              Maskable.app <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-text-dim">—</span>
            <a
              href="https://realfavicongenerator.net"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:text-primary-hover transition-colors"
            >
              Favicon Generator <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* URLs de acceso */}
      {slug && (
        <div className="flex gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20">
          <Smartphone className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div className="text-xs space-y-2 flex-1 min-w-0">
            <p className="font-medium text-text">URLs de acceso a la PWA</p>

            {prodUrl && (
              <div className="flex items-center gap-2">
                <span className="text-text-dim shrink-0">Producción:</span>
                <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-[11px] truncate">
                  {prodUrl}
                </code>
                <CopyButton text={prodUrl} label="producción" />
              </div>
            )}

            {devUrl && (
              <div className="flex items-center gap-2">
                <span className="text-text-dim shrink-0">Desarrollo:</span>
                <code className="text-text-muted bg-surface px-1.5 py-0.5 rounded text-[11px] truncate">
                  {devUrl}
                </code>
                <CopyButton text={devUrl} label="desarrollo" />
              </div>
            )}

            <p className="text-text-dim text-[10px]">
              Compartí la URL de producción con el cliente para que acceda a su app personalizada.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

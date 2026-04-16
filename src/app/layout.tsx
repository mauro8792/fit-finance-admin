import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fit Finance — Admin",
  description: "Panel de administración de Fit Finance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a2e",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#f0f0f5",
            },
          }}
        />
      </body>
    </html>
  );
}

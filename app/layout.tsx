import type { Metadata } from "next";
import { CanvasShell } from "@/components/canvas/CanvasShell";
import { ScrollProvider } from "@/components/scroll/ScrollProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulseCare — Fondations",
  description: "Démonstration synthétique d'aide à la surveillance médicale.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <ScrollProvider>
          <CanvasShell />
          <div className="dom-layer">
            {children}
            <footer className="clinical-disclaimer">
              Outil d’aide à la surveillance. Ne remplace pas le jugement clinique.
            </footer>
          </div>
        </ScrollProvider>
      </body>
    </html>
  );
}

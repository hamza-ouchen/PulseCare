import type { ReactNode } from "react";
import { ClinicalShell } from "@/components/ui/ClinicalShell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <ClinicalShell>{children}</ClinicalShell>;
}

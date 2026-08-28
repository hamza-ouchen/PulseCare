"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SignOutButton } from "./SignOutButton";
import styles from "./ClinicalShell.module.css";

const links = [
  ["Overview", "/dashboard"],
  ["Patients", "/patients"],
  ["Alerts", "/alerts"],
  ["Medical records", "/records"],
  ["Environment", "/environment"],
] as const;

export function ClinicalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className={styles.station}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/dashboard"><span>PC</span><div><strong>PulseCare</strong><small>Clinical Command Center</small></div></Link>
        <div className={styles.system}><span className={styles.liveDot} /> SYSTEM LIVE <time suppressHydrationWarning>{new Date().toLocaleDateString("fr-FR")}</time></div>
      </header>
      <aside className={styles.rail} aria-label="Navigation clinique">
        <nav>{links.map(([label, href], index) => <Link aria-current={pathname === href ? "page" : undefined} href={href} key={href} prefetch><span>0{index + 1}</span>{label}</Link>)}</nav>
        <SignOutButton />
      </aside>
      <div className={styles.workspace}>{children}</div>
      <footer className={styles.statusbar}><span>SECURE TELEMETRY</span><span>4 SYNTHETIC PATIENTS</span><span>GOOGLE SHEETS LIVE FEED</span></footer>
    </div>
  );
}

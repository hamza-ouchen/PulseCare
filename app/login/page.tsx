import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Connexion médecin — PulseCare",
};

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.atmosphere} aria-hidden="true" />
      <section className={styles.panel} aria-labelledby="login-title">
        <header className={styles.header}>
          <p className={styles.eyebrow}>PULSECARE / SECURE CLINICAL ACCESS</p>
          <h1 id="login-title">Enter Command Center</h1>
          <p>Authentification médecin vers la station de télémétrie sécurisée.</p>
        </header>
        <LoginForm />
        <div className={styles.securityRail}><span>● ENCRYPTED SESSION</span><span>CLINICAL ACCESS</span></div>
        <p className={styles.demoNotice}>Démonstration académique — aucune donnée patient réelle.</p>
      </section>
    </main>
  );
}

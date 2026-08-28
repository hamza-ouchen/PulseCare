import { ProductCoreView } from "@/components/canvas/ProductCoreView";
import { DoctorDashboardClient } from "@/components/monitoring/DoctorDashboardClient";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <main className={styles.page}>
      <ProductCoreView />
      <section className={styles.panel}>
        <div>
          <p className={styles.eyebrow}>PULSECARE / MONITORING LIVE</p>
          <h1>Vue clinique</h1>
          <p>Surveillance synthétique des quatre patients.</p>
        </div>
        <span className={styles.live}>CENTRAL STATION ONLINE</span>
      </section>
      <DoctorDashboardClient />
    </main>
  );
}

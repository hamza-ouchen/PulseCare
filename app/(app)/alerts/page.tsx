import { AlertsCenterClient } from "@/components/monitoring/AlertsCenterClient";
import styles from "@/components/monitoring/StationPages.module.css";
export default function AlertsPage() { return <main className={styles.page}><header className={styles.header}><div><p>ALARM TRIAGE</p><h1>Alert center</h1></div><span>Rule-engine authority · AI separated</span></header><AlertsCenterClient /></main>; }

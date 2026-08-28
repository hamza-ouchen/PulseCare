import { EnvironmentStationClient } from "@/components/monitoring/EnvironmentStationClient";
import styles from "@/components/monitoring/StationPages.module.css";
export default function EnvironmentPage() { return <main className={styles.page}><header className={styles.header}><div><p>ROOM TELEMETRY</p><h1>Environment station</h1></div><span>Ambient conditions · physiological data separated</span></header><EnvironmentStationClient /></main>; }

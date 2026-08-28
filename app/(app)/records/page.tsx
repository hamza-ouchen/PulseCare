import { MedicalRecordsClient } from "@/components/monitoring/MedicalRecordsClient";
import styles from "@/components/monitoring/StationPages.module.css";
export default function RecordsPage() { return <main className={styles.page}><header className={styles.header}><div><p>MEDICAL CONTEXT</p><h1>Patient records</h1></div><span>Read-only synthetic records</span></header><MedicalRecordsClient /></main>; }

import { PatientsRosterClient } from "@/components/monitoring/PatientsRosterClient";
import styles from "@/components/monitoring/StationPages.module.css";
export default function PatientsPage() { return <main className={styles.page}><header className={styles.header}><div><p>CLINICAL CENSUS</p><h1>Patients</h1></div><span>4 monitored at home</span></header><PatientsRosterClient /></main>; }

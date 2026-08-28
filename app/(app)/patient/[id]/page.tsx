import { notFound } from "next/navigation";
import { ProductCoreView } from "@/components/canvas/ProductCoreView";
import { PatientMonitoringClient } from "@/components/monitoring/PatientMonitoringClient";
import { isPatientId } from "@/lib/monitoring/patient-data";
import { PATIENT_IDS } from "@/lib/monitoring/types";
import styles from "./patient.module.css";

type PatientPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return PATIENT_IDS.map((id) => ({ id }));
}

export default async function PatientPage({ params }: PatientPageProps) {
  const { id } = await params;
  if (!isPatientId(id)) notFound();

  return (
    <main className={styles.page}>
      <div className={styles.phaseOne}><ProductCoreView /></div>
      <aside className={styles.panel}>
        <p className={styles.eyebrow}>DIGITAL PATIENT TWIN / {id}</p>
        <h1>Patient monitor</h1>
        <p>Physiological state, personal baseline, clinical timeline and telemetry health.</p>
      </aside>
      <section className={styles.monitoring} aria-label={`Monitoring ${id}`}>
        <PatientMonitoringClient patientId={id} />
      </section>
    </main>
  );
}

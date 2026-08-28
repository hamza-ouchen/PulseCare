import type { PatientMeasurement } from "@/lib/monitoring/types";
import { formatValue } from "./format";
import styles from "./Monitoring.module.css";
const booleanLabel = (value: boolean | null) => value === null ? "—" : value ? "Oui" : "Non";
export function DataQuality({ current }: { current: PatientMeasurement }) { return <article className={styles.panel}><p className={styles.eyebrow}>QUALITÉ DES DONNÉES</p><h2>Intégrité technique</h2><dl className={styles.details}><div><dt>Qualité</dt><dd>{current.data_quality ?? "—"}</dd></div><div><dt>Complétude</dt><dd>{formatValue(current.completeness_percent)} %</dd></div><div><dt>Anonymisé</dt><dd>{booleanLabel(current.privacy_anonymized)}</dd></div><div><dt>Identité transmise à l’IA</dt><dd>{booleanLabel(current.identity_sent_to_ai)}</dd></div></dl></article>; }

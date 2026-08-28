import { fetchCsv, type CsvRow } from "./csv";
import {
  normalizeArray,
  normalizeBoolean,
  normalizeDate,
  normalizeNumber,
  normalizeOptionalRisk,
  normalizeOverallTrend,
  normalizePriority,
  normalizeRisk,
  normalizeString,
  normalizeStringArray,
  normalizeTrend,
} from "./normalization";
import {
  PATIENT_IDS,
  type DashboardFreshness,
  type DashboardMonitoringResponse,
  type Freshness,
  type PatientAlert,
  type PatientId,
  type PatientMeasurement,
  type PatientMedicalRecord,
  type PatientMonitoringResponse,
  type RoomEnvironmentMeasurement,
} from "./types";

const GRAPH_MEASUREMENT_LIMIT = 60;
const ALERT_LIMIT = 20;

export function isPatientId(value: string): value is PatientId {
  return PATIENT_IDS.includes(value as PatientId);
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing monitoring environment variable: ${name}`);
  return value;
}

function normalizeMeasurement(row: CsvRow, patientId: PatientId): PatientMeasurement | null {
  const measurementId = normalizeString(row.measurement_id);
  const measuredAt = normalizeDate(row.measured_at);
  if (!measurementId || !measuredAt) return null;
  return {
    measurement_id: measurementId, patient_id: patientId,
    room_id: normalizeString(row.room_id), measured_at: measuredAt,
    received_at: normalizeDate(row.received_at), source: normalizeString(row.source),
    heart_rate: normalizeNumber(row.heart_rate), spo2: normalizeNumber(row.spo2),
    body_temperature: normalizeNumber(row.body_temperature), respiratory_rate: normalizeNumber(row.respiratory_rate),
    systolic_bp: normalizeNumber(row.systolic_bp), diastolic_bp: normalizeNumber(row.diastolic_bp),
    activity_level: normalizeString(row.activity_level), position: normalizeString(row.position),
    pain_level: normalizeNumber(row.pain_level), fatigue_level: normalizeNumber(row.fatigue_level),
    dyspnea_level: normalizeNumber(row.dyspnea_level), dizziness: normalizeBoolean(row.dizziness), nausea: normalizeBoolean(row.nausea),
    latitude: normalizeNumber(row.latitude), longitude: normalizeNumber(row.longitude),
    device_id: normalizeString(row.device_id), battery_level: normalizeNumber(row.battery_level),
    wifi_rssi: normalizeNumber(row.wifi_rssi), signal_quality: normalizeString(row.signal_quality),
    data_quality: normalizeString(row.data_quality), completeness_percent: normalizeNumber(row.completeness_percent),
    risk_level: normalizeRisk(row.risk_level), priority: normalizePriority(row.priority), alert: normalizeBoolean(row.alert),
    alert_categories: normalizeArray(row.alert_categories), triggered_rules: normalizeArray(row.triggered_rules),
    technical_alerts: normalizeArray(row.technical_alerts), alert_event: normalizeString(row.alert_event),
    previous_risk_level: normalizeOptionalRisk(row.previous_risk_level), trend_heart_rate: normalizeTrend(row.trend_heart_rate),
    trend_spo2: normalizeTrend(row.trend_spo2), trend_body_temperature: normalizeTrend(row.trend_body_temperature),
    trend_respiratory_rate: normalizeTrend(row.trend_respiratory_rate), trend_systolic_bp: normalizeTrend(row.trend_systolic_bp),
    trend_diastolic_bp: normalizeTrend(row.trend_diastolic_bp), avg_10min_heart_rate: normalizeNumber(row.avg_10min_heart_rate),
    avg_10min_spo2: normalizeNumber(row.avg_10min_spo2), avg_10min_respiratory_rate: normalizeNumber(row.avg_10min_respiratory_rate),
    overall_trend: normalizeOverallTrend(row.overall_trend), clinical_summary: normalizeString(row.clinical_summary),
    critical_factors: normalizeArray(row.critical_factors), recommended_checks: normalizeArray(row.recommended_checks),
    doctor_attention_points: normalizeArray(row.doctor_attention_points), ai_analysis_status: normalizeString(row.ai_analysis_status),
    privacy_anonymized: normalizeBoolean(row.privacy_anonymized), identity_sent_to_ai: normalizeBoolean(row.identity_sent_to_ai),
    processed_at: normalizeDate(row.processed_at),
  };
}

function newestTimestamp(measurement: PatientMeasurement): number {
  return Date.parse(measurement.processed_at ?? measurement.received_at ?? measurement.measured_at);
}

function normalizeAlert(row: CsvRow, patientId: PatientId): PatientAlert | null {
  const alertId = normalizeString(row.alert_id);
  const detectedAt = normalizeDate(row.detected_at);
  if (!alertId || !detectedAt) return null;
  return {
    alert_id: alertId, measurement_id: normalizeString(row.measurement_id), patient_id: patientId,
    room_id: normalizeString(row.room_id), category: normalizeStringArray(row.category), severity: normalizeString(row.severity),
    priority: normalizePriority(row.priority), event_type: normalizeString(row.event_type), status: normalizeString(row.status),
    trigger_summary: normalizeString(row.trigger_summary), clinical_summary: normalizeString(row.clinical_summary),
    document_id: normalizeString(row.document_id), document_link: normalizeString(row.document_link), detected_at: detectedAt,
    event_created_at: normalizeDate(row.event_created_at),
  };
}

function normalizeMedicalRecord(row: CsvRow, patientId: PatientId): PatientMedicalRecord {
  return {
    patient_id: patientId, first_name: normalizeString(row.first_name), last_name: normalizeString(row.last_name),
    age: normalizeNumber(row.age), sex: normalizeString(row.sex), blood_group: normalizeString(row.blood_group),
    height_cm: normalizeNumber(row.height_cm), weight_kg: normalizeNumber(row.weight_kg),
    primary_condition: normalizeString(row.primary_condition), secondary_conditions: normalizeStringArray(row.secondary_conditions),
    allergies: normalizeStringArray(row.allergies), current_medications: normalizeStringArray(row.current_medications),
    medical_history: normalizeString(row.medical_history), surgical_history: normalizeString(row.surgical_history),
    smoking_status: normalizeString(row.smoking_status), alcohol_use: normalizeString(row.alcohol_use),
    mobility_level: normalizeString(row.mobility_level), baseline_heart_rate: normalizeNumber(row.baseline_heart_rate),
    baseline_spo2: normalizeNumber(row.baseline_spo2), baseline_body_temperature: normalizeNumber(row.baseline_body_temperature),
    baseline_respiratory_rate: normalizeNumber(row.baseline_respiratory_rate), baseline_systolic_bp: normalizeNumber(row.baseline_systolic_bp),
    baseline_diastolic_bp: normalizeNumber(row.baseline_diastolic_bp), monitoring_reason: normalizeString(row.monitoring_reason),
    care_start_date: normalizeDate(row.care_start_date), assigned_doctor: normalizeString(row.assigned_doctor),
    emergency_contact: normalizeString(row.emergency_contact), notes: normalizeString(row.notes),
  };
}

function calculateFreshness(measuredAt: string | undefined): Freshness {
  if (!measuredAt) return "OFFLINE";
  const ageMinutes = Math.max(0, Date.now() - Date.parse(measuredAt)) / 60000;
  if (ageMinutes < 5) return "FRESH";
  if (ageMinutes <= 10) return "STALE";
  return "OFFLINE";
}

function normalizeEnvironmentMeasurement(row: CsvRow, patientId: PatientId): RoomEnvironmentMeasurement | null {
  const id = normalizeString(row.environment_measurement_id);
  const measuredAt = normalizeDate(row.measured_at);
  if (!id || !measuredAt) return null;
  return {
    environment_measurement_id: id,
    patient_id: patientId,
    room_id: normalizeString(row.room_id),
    ambient_temperature: normalizeNumber(row.ambient_temperature),
    humidity: normalizeNumber(row.humidity),
    pressure: normalizeNumber(row.pressure),
    source: normalizeString(row.source),
    sensor: normalizeString(row.sensor),
    device_id: normalizeString(row.device_id),
    measured_at: measuredAt,
  };
}

function environmentForPatient(rows: CsvRow[], patientId: PatientId): RoomEnvironmentMeasurement[] {
  const deduplicated = new Map<string, RoomEnvironmentMeasurement>();
  rows.filter((row) => normalizeString(row.patient_id) === patientId).forEach((row) => {
    const measurement = normalizeEnvironmentMeasurement(row, patientId);
    if (!measurement) return;
    const existing = deduplicated.get(measurement.environment_measurement_id);
    if (!existing || Date.parse(measurement.measured_at) >= Date.parse(existing.measured_at)) {
      deduplicated.set(measurement.environment_measurement_id, measurement);
    }
  });
  return [...deduplicated.values()].sort((a, b) => Date.parse(a.measured_at) - Date.parse(b.measured_at));
}

async function fetchEnvironmentRows(): Promise<CsvRow[]> {
  const url = process.env.ROOM_CONDITIONS_CSV_URL;
  if (!url) return [];
  try {
    return await fetchCsv(url);
  } catch (error) {
    console.warn("Room environment CSV is temporarily unavailable", error);
    return [];
  }
}

function dashboardFreshness(measuredAt: string | undefined): DashboardFreshness {
  const freshness = calculateFreshness(measuredAt);
  return freshness === "FRESH" ? "LIVE" : freshness === "STALE" ? "DELAYED" : "OFFLINE";
}

function measurementsForPatient(rows: CsvRow[], patientId: PatientId): PatientMeasurement[] {
  const deduplicated = new Map<string, PatientMeasurement>();
  rows.filter((row) => normalizeString(row.patient_id) === patientId).forEach((row) => {
    const measurement = normalizeMeasurement(row, patientId);
    if (!measurement) return;
    const existing = deduplicated.get(measurement.measurement_id);
    if (!existing || newestTimestamp(measurement) >= newestTimestamp(existing)) {
      deduplicated.set(measurement.measurement_id, measurement);
    }
  });
  return [...deduplicated.values()].sort((a, b) => Date.parse(a.measured_at) - Date.parse(b.measured_at));
}

function alertsForPatient(rows: CsvRow[], patientId: PatientId): PatientAlert[] {
  return rows
    .filter((row) => normalizeString(row.patient_id) === patientId)
    .map((row) => normalizeAlert(row, patientId))
    .filter((alert): alert is PatientAlert => alert !== null)
    .sort((a, b) => Date.parse(b.detected_at) - Date.parse(a.detected_at));
}

function isActiveAlert(alert: PatientAlert): boolean {
  const status = alert.status?.trim().toUpperCase();
  return !status || !["RESOLVED", "CLOSED", "DISMISSED"].includes(status);
}

export async function getDashboardMonitoring(): Promise<DashboardMonitoringResponse> {
  const [measurementRows, alertRows, medicalRows, environmentRows] = await Promise.all([
    fetchCsv(requiredEnvironment("PATIENT_MEASUREMENTS_CSV_URL")),
    fetchCsv(requiredEnvironment("ALERTS_CSV_URL")),
    fetchCsv(requiredEnvironment("DOSSIER_MEDICALE_CSV_URL")),
    fetchEnvironmentRows(),
  ]);
  const riskRank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as const;
  const freshnessRank = { LIVE: 0, DELAYED: 1, OFFLINE: 2 } as const;
  const patients = PATIENT_IDS.map((patientId) => {
    const recentMeasurements = measurementsForPatient(measurementRows, patientId).slice(-24);
    const current = recentMeasurements.at(-1) ?? null;
    const activeAlert = alertsForPatient(alertRows, patientId).find(isActiveAlert) ?? null;
    const recordRow = medicalRows.find((row) => normalizeString(row.patient_id) === patientId);
    const environmentCurrent = environmentForPatient(environmentRows, patientId).at(-1) ?? null;
    return {
      patientId,
      current,
      recentMeasurements,
      medicalRecord: recordRow ? normalizeMedicalRecord(recordRow, patientId) : null,
      environmentCurrent,
      environmentFreshness: dashboardFreshness(environmentCurrent?.measured_at),
      freshness: dashboardFreshness(current?.measured_at),
      activeAlert,
      hasActiveAlert: current?.alert === true || activeAlert !== null,
    };
  }).sort((a, b) => {
    const riskDifference = riskRank[a.current?.risk_level ?? "LOW"] - riskRank[b.current?.risk_level ?? "LOW"];
    return riskDifference || freshnessRank[a.freshness] - freshnessRank[b.freshness];
  });
  const activeAlerts = PATIENT_IDS.flatMap((patientId) => alertsForPatient(alertRows, patientId)).filter(isActiveAlert);
  const qualityValues = patients
    .map(({ current }) => current?.completeness_percent)
    .filter((value): value is number => value !== null && value !== undefined);
  return {
    patients,
    alerts: PATIENT_IDS.flatMap((patientId) => alertsForPatient(alertRows, patientId))
      .sort((a, b) => Date.parse(b.detected_at) - Date.parse(a.detected_at)),
    kpis: {
      patientsMonitored: patients.filter(({ current }) => current !== null).length,
      criticalHighAlerts: activeAlerts.filter(({ severity }) => severity === "CRITICAL" || severity === "HIGH").length,
      offlinePatients: patients.filter(({ freshness }) => freshness === "OFFLINE").length,
      averageDataQuality: qualityValues.length
        ? qualityValues.reduce((sum, value) => sum + value, 0) / qualityValues.length
        : null,
    },
    updatedAt: new Date().toISOString(),
  };
}

export async function getPatientMonitoring(patientId: PatientId): Promise<PatientMonitoringResponse> {
  const [measurementRows, alertRows, medicalRows, environmentRows] = await Promise.all([
    fetchCsv(requiredEnvironment("PATIENT_MEASUREMENTS_CSV_URL")),
    fetchCsv(requiredEnvironment("ALERTS_CSV_URL")),
    fetchCsv(requiredEnvironment("DOSSIER_MEDICALE_CSV_URL")),
    fetchEnvironmentRows(),
  ]);
  const allMeasurements = measurementsForPatient(measurementRows, patientId);
  const measurements = allMeasurements.slice(-GRAPH_MEASUREMENT_LIMIT);
  const current = measurements.at(-1) ?? null;
  const alerts = alertsForPatient(alertRows, patientId).slice(0, ALERT_LIMIT);
  const recordRow = medicalRows.find((row) => normalizeString(row.patient_id) === patientId);
  const medicalRecord = recordRow ? normalizeMedicalRecord(recordRow, patientId) : null;
  const environmentMeasurements = environmentForPatient(environmentRows, patientId).slice(-GRAPH_MEASUREMENT_LIMIT);
  const environmentCurrent = environmentMeasurements.at(-1) ?? null;
  return {
    patientId, current, measurements, alerts, medicalRecord,
    environment: {
      current: environmentCurrent,
      measurements: environmentMeasurements,
      freshness: calculateFreshness(environmentCurrent?.measured_at),
    },
    meta: {
      updatedAt: new Date().toISOString(), freshness: calculateFreshness(current?.measured_at),
      measurementCount: measurements.length, alertCount: alerts.length,
    },
  };
}

export const PATIENT_IDS = ["PATIENT-001", "PATIENT-002", "PATIENT-003", "PATIENT-004"] as const;

export type PatientId = (typeof PATIENT_IDS)[number];
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Priority = "ROUTINE" | "MONITOR" | "URGENT_REVIEW" | "IMMEDIATE_REVIEW";
export type Trend = "UP" | "DOWN" | "STABLE" | "UNKNOWN";
export type OverallTrend = "IMPROVING" | "STABLE" | "DEGRADING" | "UNKNOWN";
export type Freshness = "FRESH" | "STALE" | "OFFLINE";

export type PatientMeasurement = {
  measurement_id: string;
  patient_id: PatientId;
  room_id: string | null;
  measured_at: string;
  received_at: string | null;
  source: string | null;
  heart_rate: number | null;
  spo2: number | null;
  body_temperature: number | null;
  respiratory_rate: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  activity_level: string | null;
  position: string | null;
  pain_level: number | null;
  fatigue_level: number | null;
  dyspnea_level: number | null;
  dizziness: boolean | null;
  nausea: boolean | null;
  latitude: number | null;
  longitude: number | null;
  device_id: string | null;
  battery_level: number | null;
  wifi_rssi: number | null;
  signal_quality: string | null;
  data_quality: string | null;
  completeness_percent: number | null;
  risk_level: RiskLevel;
  priority: Priority;
  alert: boolean | null;
  alert_categories: unknown[];
  triggered_rules: unknown[];
  technical_alerts: unknown[];
  alert_event: string | null;
  previous_risk_level: RiskLevel | null;
  trend_heart_rate: Trend;
  trend_spo2: Trend;
  trend_body_temperature: Trend;
  trend_respiratory_rate: Trend;
  trend_systolic_bp: Trend;
  trend_diastolic_bp: Trend;
  avg_10min_heart_rate: number | null;
  avg_10min_spo2: number | null;
  avg_10min_respiratory_rate: number | null;
  overall_trend: OverallTrend;
  clinical_summary: string | null;
  critical_factors: unknown[];
  recommended_checks: unknown[];
  doctor_attention_points: unknown[];
  ai_analysis_status: string | null;
  privacy_anonymized: boolean | null;
  identity_sent_to_ai: boolean | null;
  processed_at: string | null;
};

export type PatientAlert = {
  alert_id: string;
  measurement_id: string | null;
  patient_id: PatientId;
  room_id: string | null;
  category: string[];
  severity: string | null;
  priority: Priority;
  event_type: string | null;
  status: string | null;
  trigger_summary: string | null;
  clinical_summary: string | null;
  document_id: string | null;
  document_link: string | null;
  detected_at: string;
  event_created_at: string | null;
};

export type PatientMedicalRecord = {
  patient_id: PatientId;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  sex: string | null;
  blood_group: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  primary_condition: string | null;
  secondary_conditions: string[];
  allergies: string[];
  current_medications: string[];
  medical_history: string | null;
  surgical_history: string | null;
  smoking_status: string | null;
  alcohol_use: string | null;
  mobility_level: string | null;
  baseline_heart_rate: number | null;
  baseline_spo2: number | null;
  baseline_body_temperature: number | null;
  baseline_respiratory_rate: number | null;
  baseline_systolic_bp: number | null;
  baseline_diastolic_bp: number | null;
  monitoring_reason: string | null;
  care_start_date: string | null;
  assigned_doctor: string | null;
  emergency_contact: string | null;
  notes: string | null;
};

export type RoomEnvironmentMeasurement = {
  environment_measurement_id: string;
  patient_id: PatientId;
  room_id: string | null;
  ambient_temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  source: string | null;
  sensor: string | null;
  device_id: string | null;
  measured_at: string;
};

export type PatientMonitoringResponse = {
  patientId: PatientId;
  current: PatientMeasurement | null;
  measurements: PatientMeasurement[];
  alerts: PatientAlert[];
  medicalRecord: PatientMedicalRecord | null;
  environment: {
    current: RoomEnvironmentMeasurement | null;
    measurements: RoomEnvironmentMeasurement[];
    freshness: Freshness;
  };
  meta: {
    updatedAt: string;
    freshness: Freshness;
    measurementCount: number;
    alertCount: number;
  };
};

export type DashboardFreshness = "LIVE" | "DELAYED" | "OFFLINE";

export type DashboardPatientSummary = {
  patientId: PatientId;
  current: PatientMeasurement | null;
  recentMeasurements: PatientMeasurement[];
  medicalRecord: PatientMedicalRecord | null;
  environmentCurrent: RoomEnvironmentMeasurement | null;
  environmentFreshness: DashboardFreshness;
  freshness: DashboardFreshness;
  activeAlert: PatientAlert | null;
  hasActiveAlert: boolean;
};

export type DashboardMonitoringResponse = {
  patients: DashboardPatientSummary[];
  alerts: PatientAlert[];
  kpis: {
    patientsMonitored: number;
    criticalHighAlerts: number;
    offlinePatients: number;
    averageDataQuality: number | null;
  };
  updatedAt: string;
};

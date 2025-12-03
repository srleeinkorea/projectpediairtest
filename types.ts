
export type ScreenName = 'home' | 'triage' | 'ventilator' | 'emr' | 'pro' | 'report' | 'clinic' | 'more';

export interface PatientData {
  name: string;
  age: number;
  emrDiagnosis: string;
  spo2: number;
  rr: number;
  vtidal_measured: number;
  vtidal_target: number;
  p_peak_measured: number;
  p_peak_threshold: number;
  p_drive_measured: number;
  fio2_setting: number;
  rate_setting: number;
  patient_rate: number;
  compliance: string;

}


export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
}

export const DANGER_DATA: PatientData = {
  name: "김민성",
  age: 5,
  emrDiagnosis: "만성 호흡부전 (s/p Tracheostomy)",
  spo2: 89,
  rr: 42,
  vtidal_measured: 60,
  vtidal_target: 55,
  p_peak_measured: 35, // High pressure due to phlegm/obstruction
  p_peak_threshold: 30,
  p_drive_measured: 20,
  fio2_setting: 40,
  rate_setting: 20,
  patient_rate: 22,
  compliance: "저하 (가래/폐쇄 의심)"
};

export const SAFE_DATA: PatientData = {
  name: "김민성",
  age: 5,
  emrDiagnosis: "만성 호흡부전 (s/p Tracheostomy)",
  spo2: 98,
  rr: 24,
  vtidal_measured: 56,
  vtidal_target: 55,
  p_peak_measured: 18, // Normal pressure
  p_peak_threshold: 30,
  p_drive_measured: 12,
  fio2_setting: 30,
  rate_setting: 20,
  patient_rate: 20, // Synchronized
  compliance: "정상"
};

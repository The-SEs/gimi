export type AlertSeverity = "Critical" | "Warning" | "Info";

export interface AlertHistoryItem {
  id: string;
  label: string;
  severity: AlertSeverity;
  reportedAt: string;
}

export interface EmergencyContact {
  id: string;
  role: string;
  name: string;
  phoneNumber: string;
}

export interface StudentSecurityCase {
  id: string;
  name: string;
  email: string;
  age: string;
  sex: string;
  program: string;
  pronouns: string;
  studentNumber: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  lastSeen: string;
  detectedKeywords: string[];
  alertHistory: AlertHistoryItem[];
  emergencyContacts: EmergencyContact[];
}

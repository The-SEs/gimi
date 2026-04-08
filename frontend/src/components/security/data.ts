import type { StudentSecurityCase } from "./types";

export const studentCase: StudentSecurityCase = {
  name: "Zoie Estorba",
  age: "56 yrs old",
  sex: "Female",
  pronouns: "She/Her",
  studentNumber: "C202301020207",
  program: "CSC-31",
  riskLevel: "HIGH",
  summary:
    "Student flagged as HIGH RISK for security monitoring. Recent concerning behavior detected.",
  lastSeen: "Today, 2:45 PM",
  detectedKeywords: ["Kms", "Kill", "Princess", "Dead"],
  alertHistory: [
    {
      id: "alert-1",
      label: "SOS Alert",
      severity: "Critical",
      reportedAt: "March 22, 2026",
    },
    {
      id: "alert-2",
      label: "Unusual Behavior",
      severity: "Warning",
      reportedAt: "March 21, 2026",
    },
    {
      id: "alert-3",
      label: "Missed Check-in",
      severity: "Warning",
      reportedAt: "March 20, 2026",
    },
    {
      id: "alert-4",
      label: "Late Arrival",
      severity: "Info",
      reportedAt: "March 19, 2026",
    },
  ],
  emergencyContacts: [
    {
      id: "contact-1",
      role: "Guardian",
      name: "Parent Name",
      phoneNumber: "+639171002001",
    },
    {
      id: "contact-2",
      role: "Guidance",
      name: "Guidance Counselor",
      phoneNumber: "+639171002002",
    },
    {
      id: "contact-3",
      role: "Clinic",
      name: "Nurse",
      phoneNumber: "+639171002003",
    },
  ],
};

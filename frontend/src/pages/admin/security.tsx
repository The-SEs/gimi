import type { ReactNode } from "react";
import { useState } from "react";
import { AlertTriangle, Eye, Phone, type LucideIcon } from "lucide-react";

type AlertSeverity = "Critical" | "Warning" | "Info";

interface AlertHistoryItem {
  id: string;
  label: string;
  severity: AlertSeverity;
  reportedAt: string;
}

interface EmergencyContact {
  id: string;
  role: string;
  name: string;
  phoneNumber: string;
}

interface StudentSecurityCase {
  name: string;
  age: string;
  sex: string;
  pronouns: string;
  studentNumber: string;
  program: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  lastSeen: string;
  detectedKeywords: string[];
  alertHistory: AlertHistoryItem[];
  emergencyContacts: EmergencyContact[];
}

const studentCase: StudentSecurityCase = {
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

const severityLabelStyles: Record<AlertSeverity, string> = {
  Critical: "text-[#b91c1c]",
  Warning: "text-[#b45309]",
  Info: "text-[#475569]",
};

const profileFacts = [
  { label: "Student Num", value: studentCase.studentNumber },
  { label: "Program", value: studentCase.program },
  { label: "Risk Level", value: studentCase.riskLevel },
  { label: "Last Seen", value: studentCase.lastSeen },
] as const;

interface SectionCardProps {
  title: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}

function SectionCard({
  title,
  icon: Icon,
  actionLabel,
  onAction,
  children,
}: SectionCardProps) {
  return (
    <section className="overflow-hidden rounded-[12px] border border-[#e3e7ef] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <header className="flex items-center justify-between gap-3 bg-[#eef0f4] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-[#5f6673]">
          {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
          <h2 className="text-[0.95rem] font-semibold">{title}</h2>
        </div>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="rounded-md px-2 py-1 text-sm font-semibold text-[#5a7cff] transition hover:bg-white/80 hover:text-[#4768ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5a7cff]"
          >
            {actionLabel}
          </button>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function SecurityAdminPage() {
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const alertsToShow = showAllAlerts
    ? studentCase.alertHistory
    : studentCase.alertHistory.slice(0, 4);

  return (
    <div className="mx-auto min-h-[calc(100vh-5.5rem)] w-full overflow-hidden rounded-[14px] border border-[#cfd7e2] bg-white">
      <div className="grid min-h-[calc(100vh-5.5rem)] grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-[#cfd7e2] bg-white xl:border-r xl:border-b-0">
          <div className="px-5 py-5">
            <div className="flex items-center justify-between gap-3 border-b border-[#e8ebf1] pb-3">
              <h1 className="text-[1.25rem] font-semibold tracking-tight text-[#1f2937]">
                {studentCase.name}
              </h1>
              <div className="inline-flex items-center gap-1.5 rounded-full px-1 text-[0.82rem] font-medium text-[#5a7cff]">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                Monitoring
              </div>
            </div>

            <div className="space-y-5 pt-5">
              <p className="max-w-[230px] text-[0.94rem] leading-6 text-[#667180]">
                Student flagged as{" "}
                <span className="font-bold text-[#ef4444]">{studentCase.riskLevel} RISK</span> for
                security monitoring. Recent concerning behavior detected.
              </p>

              <div className="flex flex-wrap gap-2">
                {studentCase.detectedKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-[14px] border border-[#f1d4d7] bg-[#f8dfe0] px-3.5 py-1.5 text-[0.82rem] font-semibold text-[#d76b72]"
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <span className="rounded-[14px] border border-[#cfd4dd] bg-white px-4 py-1.5 text-[0.82rem] font-medium text-[#5f6673]">
                  {studentCase.age}
                </span>
                <span className="rounded-[14px] border border-[#cfd4dd] bg-white px-4 py-1.5 text-[0.82rem] font-medium text-[#5f6673]">
                  {studentCase.sex}
                </span>
                <span className="rounded-[14px] border border-[#cfd4dd] bg-white px-4 py-1.5 text-[0.82rem] font-medium text-[#5f6673]">
                  {studentCase.pronouns}
                </span>
              </div>

              <dl className="space-y-3 pt-1 text-[0.9rem]">
                {profileFacts.map((fact) => (
                  <div key={fact.label} className="flex items-start justify-between gap-4">
                    <dt className="text-[#7a8594]">{fact.label}</dt>
                    <dd
                      className={`text-right font-medium ${
                        fact.label === "Risk Level" ? "font-bold text-[#ef4444]" : "text-[#556070]"
                      }`}
                    >
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </aside>

        <section className="bg-[#fbfcfe] px-4 py-5 sm:px-5 sm:py-6">
          <div className="mx-auto flex max-w-full flex-col gap-5">
            <SectionCard
              title="Alert History"
              icon={AlertTriangle}
              actionLabel={showAllAlerts ? "Show Less" : "View All"}
              onAction={() => setShowAllAlerts((current) => !current)}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse" aria-label="Alert history">
                  <caption className="sr-only">
                    Alert history for the selected monitored student
                  </caption>
                  <tbody>
                    {alertsToShow.map((alert) => (
                      <tr
                        key={alert.id}
                        className="border-t border-[#edf1f5] first:border-t-0 hover:bg-[#fafcff]"
                      >
                        <th
                          scope="row"
                          className="px-4 py-4 text-left text-[0.95rem] font-semibold text-[#2f3744] sm:px-5"
                        >
                          {alert.label}
                        </th>
                        <td
                          className={`px-4 py-4 text-[0.9rem] font-semibold ${severityLabelStyles[alert.severity]} sm:px-5`}
                        >
                          {alert.severity}
                        </td>
                        <td className="px-4 py-4 text-right text-[0.9rem] font-medium text-[#667180] sm:px-5">
                          {alert.reportedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="Emergency Contacts">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse" aria-label="Emergency contacts">
                  <caption className="sr-only">
                    Emergency contact list for the selected monitored student
                  </caption>
                  <tbody>
                    {studentCase.emergencyContacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="border-t border-[#edf1f5] first:border-t-0 hover:bg-[#fafcff]"
                      >
                        <th
                          scope="row"
                          className="px-4 py-4 text-left text-[0.95rem] font-semibold text-[#2f3744] sm:px-5"
                        >
                          {contact.role}
                        </th>
                        <td className="px-4 py-4 text-[0.9rem] font-medium text-[#7a8594] sm:px-5">
                          {contact.name}
                        </td>
                        <td className="px-4 py-4 text-right sm:px-5">
                          <a
                            href={`tel:${contact.phoneNumber}`}
                            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.9rem] font-medium text-[#5a7cff] transition hover:bg-[#f3f6ff] hover:text-[#4768ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5a7cff]"
                            aria-label={`Call ${contact.name}`}
                          >
                            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                            Call
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SecurityAdminPage;

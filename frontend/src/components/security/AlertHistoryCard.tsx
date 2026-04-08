import { AlertTriangle } from "lucide-react";

import { SectionCard } from "./SectionCard";
import type { AlertSeverity, StudentSecurityCase } from "./types";

interface AlertHistoryCardProps {
  studentCase: StudentSecurityCase;
  showAllAlerts: boolean;
  onToggleShowAll: () => void;
}

const severityLabelStyles: Record<AlertSeverity, string> = {
  Critical: "text-[#b91c1c]",
  Warning: "text-[#b45309]",
  Info: "text-[#475569]",
};

export function AlertHistoryCard({
  studentCase,
  showAllAlerts,
  onToggleShowAll,
}: AlertHistoryCardProps) {
  const alertsToShow = showAllAlerts
    ? studentCase.alertHistory
    : studentCase.alertHistory.slice(0, 4);

  return (
    <SectionCard
      title="Alert History"
      icon={AlertTriangle}
      actionLabel={showAllAlerts ? "Show Less" : "View All"}
      onAction={onToggleShowAll}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse" aria-label="Alert history">
          <caption className="sr-only">Alert history for the selected monitored student</caption>
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
  );
}

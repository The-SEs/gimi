import { useState } from "react";

import { AlertHistoryCard } from "../../components/security/AlertHistoryCard";
import { studentCase } from "../../components/security/data";
import { EmergencyContactsCard } from "../../components/security/EmergencyContactsCard";
import { SecuritySidebar } from "../../components/security/SecuritySidebar";

function SecurityAdminPage() {
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  return (
    <div className="mx-auto min-h-[calc(100vh-5.5rem)] w-full overflow-hidden rounded-[14px] border border-[#cfd7e2] bg-white">
      <div className="grid min-h-[calc(100vh-5.5rem)] grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)]">
        <SecuritySidebar studentCase={studentCase} />

        <section className="bg-[#fbfcfe] px-4 py-5 sm:px-5 sm:py-6">
          <div className="mx-auto flex max-w-full flex-col gap-5">
            <AlertHistoryCard
              studentCase={studentCase}
              showAllAlerts={showAllAlerts}
              onToggleShowAll={() => setShowAllAlerts((current) => !current)}
            />
            <EmergencyContactsCard studentCase={studentCase} />
          </div>
        </section>
      </div>
    </div>
  );
}

export default SecurityAdminPage;

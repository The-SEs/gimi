import React from "react";
import ContactSecurity from "../../components/admin-nurse-widget/contactSecurity.tsx";
import AlertGuidance from "../../components/admin-nurse-widget/alertGuidance.tsx";
import StudentInfo from "../../components/admin-nurse-widget/studentInfo.tsx";
import ActiveConditions from "../../components/admin-nurse-widget/activeConditions";
import CurrentMedications from "../../components/admin-nurse-widget/currentMedications";
import HospitalizationTreatmentHistory from "../../components/admin-nurse-widget/hospitalizationTreatmentHistory";
import VisitDocumentation from "../../components/admin-nurse-widget/visitDocumentation";
import RecentHistory from "../../components/admin-nurse-widget/recentHistory";

const W = ({ style, className = "" }: { style?: React.CSSProperties; className?: string }) => (
  <div
    className={`bg-white rounded-xl border border-gray-100 ${className}`}
    style={style}/>
);

export default function NurseAdminPage() {
  return (
    <div className="w-full box-border overflow-x-hidden">

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 mb-4 lg:mb-6">
        <div className="w-full lg:flex-1 min-w-0 overflow-hidden">
          <StudentInfo />
        </div>
        <div className="w-full lg:w-[35%] lg:flex-shrink-0 flex flex-row lg:flex-col items-center justify-center gap-4">
          <div className="w-full max-w-[260px]">
            <ContactSecurity />
          </div>
          <div className="w-full max-w-[260px]">
            <AlertGuidance />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
        <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-4 lg:gap-6">
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
            <div className="w-full sm:flex-[0_0_58%] min-h-[320px] lg:h-[380px]">
              <ActiveConditions />
            </div>
            <div className="w-full sm:flex-1 min-h-[320px] lg:h-[380px]">
              <CurrentMedications />
            </div>
          </div>
          <VisitDocumentation />
        </div>

        <div className="w-full lg:w-[35%] lg:flex-shrink-0 flex flex-col gap-4 lg:gap-6">
          <HospitalizationTreatmentHistory />
          <RecentHistory />
        </div>
      </div>

    </div>
  );
}
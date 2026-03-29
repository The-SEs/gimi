import React from "react";
import ContactSecurity from "../../components/admin-nurse-widget/contactSecurity.tsx";
import AlertGuidance from "../../components/admin-nurse-widget/alertGuidance.tsx";
import StudentInfo from "../../components/admin-nurse-widget/studentInfo.tsx";
import ActiveConditions from "../../components/admin-nurse-widget/activeConditions";
import CurrentMedications from "../../components/admin-nurse-widget/currentMedications";

const W = ({ style, className = "" }: { style?: React.CSSProperties; className?: string }) => (
  <div
    className={`bg-white rounded-xl border border-gray-100 ${className}`}
    style={style}/>
);

export default function NurseAdminPage() {
  return (
    <div className="w-full box-border">

    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 mb-4 lg:mb-6">

    <div className="w-full lg:flex-1 min-w-0 overflow-hidden">
      <StudentInfo />
    </div>

    <div className="w-full lg:w-[35%] lg:flex-shrink-0 flex flex-col items-center justify-center gap-4">
      <div className="w-[260px] max-w-full">
        <ContactSecurity />
      </div>
      <div className="w-[260px] max-w-full">
        <AlertGuidance />
      </div>
    </div>
    </div>
    
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
        <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-4 lg:gap-6">
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
              <div className="h-80 lg:h-[380px] sm:flex-[0_0_58%]">
                <ActiveConditions />
              </div>

              <div className="h-80 lg:h-[380px] sm:flex-1">
                <CurrentMedications />
              </div>
            </div>
            <W className="h-64 lg:h-[288px]" />
            </div>

            <div className="w-full lg:w-[35%] lg:flex-shrink-0 flex flex-col gap-4 lg:gap-6">
            <W className="min-h-[400px] lg:min-h-[520px]" />
            <W className="h-48 lg:h-[208px]" />
          </div>
      </div>
    </div>
  );
}
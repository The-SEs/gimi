import { useState } from "react";
import allergiesIcon from "../../assets/allergiesIcon.svg";

type RiskLevel = "HIGH RISK" | "MODERATE RISK" | "LOW RISK";

interface StudentInfoProps {
  studentId?: string;
  caseCode?: string;
  name?: string;
  allergies?: string[];
  primaryPhysician?: string;
  riskLevel?: RiskLevel;
}

const riskStyles: Record<RiskLevel, string> = {
  "HIGH RISK": "bg-red-100 text-red-600",
  "MODERATE RISK": "bg-yellow-100 text-yellow-600",
  "LOW RISK": "bg-green-100 text-green-600",
};

const defaultProps: Required<StudentInfoProps> = {
  studentId: "CSC-31",
  caseCode: "C20230107",
  name: "José Protasio Rizal Mercado y Alonso Realonda",
  allergies: ["Peanuts", "Seafood"],
  primaryPhysician: "DR. P. BORBAJO",
  riskLevel: "HIGH RISK",
};

export default function StudentInfo({
  studentId = defaultProps.studentId,
  caseCode = defaultProps.caseCode,
  name = defaultProps.name,
  allergies = defaultProps.allergies,
  primaryPhysician = defaultProps.primaryPhysician,
  riskLevel = defaultProps.riskLevel,
}: StudentInfoProps) {
  const [showAllergies, setShowAllergies] = useState(false);

  const allergiesText = allergies.join(", ");

  return (
    <>
      <div className="bg-white rounded-xl px-4 py-6 sm:px-6 sm:py-8 w-full overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap sm:gap-4 lg:gap-6">
          <div className="flex flex-col min-w-0 sm:w-[260px] lg:w-[300px] sm:flex-shrink-0">
            <p className="text-base text-gray-500 font-medium mb-1 truncate">
              {studentId} • {caseCode}
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 break-words leading-tight">
              {name}
            </h2>
          </div>

          <div className="flex flex-row flex-wrap items-start gap-8 min-w-0 ml-0 sm:ml-auto sm:justify-end">
            <div
              onClick={() => setShowAllergies(true)}
              className="flex items-center gap-3 bg-red-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-red-100 transition min-w-0 max-w-full sm:max-w-[260px]">
              <img src={allergiesIcon} className="w-5 h-5 flex-shrink-0" />
              <div className="leading-tight min-w-0">
                <p className="text-sm font-semibold text-gray-500">ALLERGIES</p>
                <p className="text-base text-gray-800 truncate">{allergiesText}</p>
              </div>
            </div>

            <div className="leading-tight min-w-0 ml-8">
              <p className="text-sm font-semibold text-gray-500">PRIMARY PHYSICIAN</p>
              <p className="text-base font-medium text-blue-700 break-words">
                {primaryPhysician}
              </p>
            </div>
          </div>

          <div className="sm:ml-auto flex-shrink-0">
            <span className={`text-base font-semibold px-4 py-1.5 rounded-full whitespace-nowrap ${riskStyles[riskLevel]}`}>
              {riskLevel}
            </span>
          </div>

        </div>
      </div>

{/* might be unnecessary  */}
      {showAllergies && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowAllergies(false)}>
          <div
            className="bg-[#EDE4E4] rounded-[30px] w-full max-w-[500px] py-10 px-8 flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}>
            <img src={allergiesIcon} className="w-10 h-10 mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 tracking-wide mb-6">
              ALLERGIES
            </h3>
            <p className="text-lg text-gray-700 mb-10">{allergiesText}</p>
            <button
              onClick={() => setShowAllergies(false)}
              className="bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition cursor-pointer">
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  );
}
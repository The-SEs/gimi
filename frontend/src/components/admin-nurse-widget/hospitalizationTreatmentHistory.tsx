import hospitalizationTreatmentIcon from "../../assets/hospitalizationTreatmentIcon.svg";
import level1NurseIcon from "../../assets/level1NurseIcon.svg";
import level2NurseIcon from "../../assets/level2NurseIcon.svg";
import level3NurseIcon from "../../assets/level3NurseIcon.svg";

type CareType = "IN-PATIENT CARE" | "EMERGENCY VISIT" | "INTAKE";

interface TreatmentEntry {
  date: string;
  careType: CareType;
  title: string;
  description: string;
  level: 1 | 2 | 3;
}

const entries: TreatmentEntry[] = [
  {
    date: "MAR 2 - MAR 5 2026",
    careType: "IN-PATIENT CARE",
    title: "St. Luke's Medical Center - Psychiatry Ward",
    description:
      "Admitted following acute crisis event. Discharged with stabilizing plan. Recommended 2x weekly therapy sessions with campus counselor.",
    level: 3,
  },
  {
    date: "JAN 1 2026",
    careType: "EMERGENCY VISIT",
    title: "Campus Clinic - Panic Attack Management",
    description:
      "Severe palpitations and hyperventilation during final exams. Administered Propranolol 20mg. Observed for 2 hours before release.",
    level: 2,
  },
  {
    date: "DEC 2025",
    careType: "INTAKE",
    title: "Initial Psychological Assessment",
    description:
      "Student-initiated consultation regarding persistent low mood and academic stress.",
    level: 1,
  },
];

const levelIcon = { 1: level1NurseIcon, 2: level2NurseIcon, 3: level3NurseIcon };

export default function HospitalizationHistory() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 w-full">
      <div className="flex items-center gap-2 mb-4">
        <img src={hospitalizationTreatmentIcon} className="w-7 h-7" />
        <h2 className="text-2xl font-semibold text-gray-800">
          Hospitalization & Treatment History
        </h2>
      </div>
      <div className="relative">
        <div className="absolute left-[10px] top-3 bottom-3 w-px bg-gray-200" />
        <div className="flex flex-col gap-6">
          {entries.map((entry, i) => (
            <div key={i} className="flex gap-4">
              <div className="relative z-10 flex-shrink-0 w-5 h-5 mt-0.5">
                <img src={levelIcon[entry.level]} className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-500 tracking-wide">
                    {entry.date}
                  </p>
                  <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600 break-words max-w-full">
                    {entry.careType}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {entry.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {entry.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
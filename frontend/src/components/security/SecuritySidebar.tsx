import { Eye } from "lucide-react";

import type { StudentSecurityCase } from "./types";

interface SecuritySidebarProps {
  studentCase: StudentSecurityCase;
}

const buildProfileFacts = (studentCase: StudentSecurityCase) => [
  { label: "Student Num", value: studentCase.studentNumber },
  { label: "Program", value: studentCase.program },
  { label: "Risk Level", value: studentCase.riskLevel },
  { label: "Last Seen", value: studentCase.lastSeen },
];

export function SecuritySidebar({ studentCase }: SecuritySidebarProps) {
  const profileFacts = buildProfileFacts(studentCase);

  return (
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
  );
}

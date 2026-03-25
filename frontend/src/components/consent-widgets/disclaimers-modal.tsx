import { useEffect, useState } from "react";

const sections = [
  {
    number: "1",
    title: "Mental Health Support Disclaimer",
    content: [
      "GIMI is designed as a supportive reflection tool and is not intended to replace professional counseling, therapy, or medical services.",
      "The platform does not provide mental health diagnoses, treatment, or professional psychological advice. Students experiencing significant emotional distress are encouraged to contact the guidance department or qualified professionals directly.",
    ],
  },
  {
    number: "2",
    title: "Emergency Disclaimer",
    content: [
      "The GIMI platform is not an emergency service.",
      "If a student is experiencing a crisis or believes they may harm themselves or others, they should immediately seek help from school staff, trusted individuals, or emergency services.",
      "The platform should not be relied upon for urgent mental health support.",
    ],
  },
  {
    number: "3",
    title: "Automated Monitoring Disclaimer",
    content: [
      "Journal entries submitted to the platform may be processed by automated systems designed to detect certain keywords associated with emotional distress.",
      "These automated processes are not capable of fully understanding context and may occasionally generate alerts inaccurately or fail to detect certain situations.",
      "Guidance counselors are responsible for evaluating alerts and determining whether follow-up support is necessary.",
    ],
  },
  {
    number: "4",
    title: "Limitation of Liability",
    content: [
      "The developers of GIMI and iACADEMY Cebu are not responsible for any damages, losses, or consequences arising from the use or misuse of the platform.",
      "The system is provided as a supportive tool and does not guarantee the detection of all emotional concerns or distress.",
    ],
  },
  {
    number: "5",
    title: "Technology and System Disclaimer",
    content: [
      "While reasonable efforts are made to ensure the platform operates properly, technical errors, downtime, or system limitations may occur.",
      "The developers do not guarantee uninterrupted access to the platform or error-free operation.",
    ],
  },
  {
    number: "6",
    title: "User Acknowledgment",
    content: [
      "By using the GIMI platform, users acknowledge that they understand the purpose and limitations of the system.",
      "Users agree that the platform is intended only as a supplementary tool to support emotional reflection and that it does not replace professional guidance services.",
    ],
  },
];

interface DisclaimersProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Disclaimers({ isOpen, onClose }: DisclaimersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) setMounted(true);
    else {
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: "rgba(0,0,0,0.3)",
        opacity: isOpen ? 1 : 0,
        transition: "opacity 0.2s",
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full sm:w-[520px] max-h-[80vh] flex flex-col rounded-3xl overflow-hidden bg-white"
        style={{
          boxShadow: "0 8px 40px rgba(30,60,100,0.18), 0 2px 8px rgba(30,60,100,0.10)",
          transform: isOpen ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
          transition: "transform 0.2s, opacity 0.2s",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-7 pt-7 pb-5 shrink-0"
          style={{ borderBottom: "1px solid #e2ecf8" }}
        >
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "#3a6ec4" }}>
              GIMI Journal
            </p>
            <h2 className="text-xl font-bold text-gray-900">Disclaimers</h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={{
              borderStyle: "solid",
              borderColor: "#7D9DC9",
              borderTopWidth: "1px",
              borderLeftWidth: "1px",
              borderRightWidth: "1px",
              borderBottomWidth: "3px",
              background: "rgba(210,235,255,0.40)",
              color: "#2c5aa0",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-7 py-5 space-y-5 flex-1">
          {sections.map((section) => (
            <div key={section.number}>
              <div className="flex items-center gap-2.5 mb-2">
                <span
                  className="inline-flex items-center justify-center rounded-lg text-xs font-bold shrink-0 text-white"
                  style={{
                    width: 24,
                    height: 24,
                    background: "linear-gradient(135deg, #2c5aa0, #3a6ec4)",
                  }}
                >
                  {section.number}
                </span>
                <h3 className="text-sm font-bold text-gray-900">{section.title}</h3>
              </div>

              <div className="pl-8 space-y-2">
                {section.content.map((para, i) => (
                  <p key={i} className="text-sm text-gray-700 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              <div className="mt-4" style={{ borderBottom: "1px solid #e2ecf8" }} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 shrink-0" style={{ borderTop: "1px solid #e2ecf8" }}>
          <button
            onClick={onClose}
            className="w-full rounded-xl py-3 text-white font-semibold text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            style={{
              background: "linear-gradient(90deg, #2c5aa0 0%, #3a6ec4 100%)",
              boxShadow: "0 4px 16px rgba(44,90,160,0.30)",
            }}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
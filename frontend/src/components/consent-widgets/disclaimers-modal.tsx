import { useEffect, useRef, useState, useCallback } from "react";

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
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setHasScrolledToBottom(false);
    } else {
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Check if content is short enough that no scrolling is needed
  const checkIfAlreadyAtBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight + 2) {
      setHasScrolledToBottom(true);
    }
  }, []);

  useEffect(() => {
    if (mounted && isOpen) {
      // Small delay to let the DOM render before measuring
      const t = setTimeout(checkIfAlreadyAtBottom, 50);
      return () => clearTimeout(t);
    }
  }, [mounted, isOpen, checkIfAlreadyAtBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || hasScrolledToBottom) return;
    // Allow a small threshold (2px) for rounding
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
      setHasScrolledToBottom(true);
    }
  };

  const handleClose = () => {
    if (hasScrolledToBottom) onClose();
  };

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: "rgba(0,0,0,0.3)",
        opacity: isOpen ? 1 : 0,
        transition: "opacity 0.2s",
      }}
      onClick={handleClose}
    >
      <div
        className="relative w-full sm:w-[520px] max-h-[80vh] flex flex-col rounded-3xl overflow-hidden bg-white"
        style={{
          boxShadow:
            "0 8px 40px rgba(30,60,100,0.18), 0 2px 8px rgba(30,60,100,0.10)",
          transform: isOpen
            ? "translateY(0) scale(1)"
            : "translateY(16px) scale(0.97)",
          transition: "transform 0.2s, opacity 0.2s",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div
          className="flex items-center px-7 pt-7 pb-5 shrink-0"
          style={{ borderBottom: "1px solid #e2ecf8" }}
        >
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-0.5"
              style={{ color: "#3a6ec4" }}
            >
              GIMI Journal
            </p>
            <h2 className="text-xl font-bold text-gray-900">Disclaimers</h2>
          </div>
        </div>

        {/* Scrollable body */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto px-7 py-5 space-y-5 flex-1"
        >
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
                <h3 className="text-sm font-bold text-gray-900">
                  {section.title}
                </h3>
              </div>

              <div className="pl-8 space-y-2">
                {section.content.map((para, i) => (
                  <p
                    key={i}
                    className="text-sm text-gray-700 leading-relaxed"
                  >
                    {para}
                  </p>
                ))}
              </div>

              <div
                className="mt-4"
                style={{ borderBottom: "1px solid #e2ecf8" }}
              />
            </div>
          ))}
        </div>

        {/* Scroll hint + Footer */}
        <div
          className="px-7 py-5 shrink-0"
          style={{ borderTop: "1px solid #e2ecf8" }}
        >
          {/* Scroll-down hint that disappears once scrolled */}
          {!hasScrolledToBottom && (
            <p
              className="text-xs text-center mb-3 font-medium animate-pulse"
              style={{ color: "#7D9DC9" }}
            >
              ↓ Please scroll down to read all disclaimers before continuing ↓
            </p>
          )}

          <button
            onClick={handleClose}
            disabled={!hasScrolledToBottom}
            className="w-full rounded-xl py-3 font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            style={{
              background: hasScrolledToBottom
                ? "linear-gradient(90deg, #2c5aa0 0%, #3a6ec4 100%)"
                : "linear-gradient(90deg, #94a8c4 0%, #a8b8d0 100%)",
              boxShadow: hasScrolledToBottom
                ? "0 4px 16px rgba(44,90,160,0.30)"
                : "none",
              color: hasScrolledToBottom ? "#fff" : "#d0d6e0",
              cursor: hasScrolledToBottom ? "pointer" : "not-allowed",
            }}
          >
            {hasScrolledToBottom ? "I Understand" : "Read All Disclaimers to Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
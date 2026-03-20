import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ToggleItem {
  id: string;
  label: string;
  linkText: string;
  linkHref: string;
}

const privacyItems: ToggleItem[] = [
  {
    id: "disclaimer",
    label: "I have read and understood the",
    linkText: "disclaimers",
    linkHref: "#",
  },
];

const consentItems: ToggleItem[] = [
  {
    id: "terms",
    label: "I agree to GIMI Journal's",
    linkText: "Terms & Conditions",
    linkHref: "#",
  },
  {
    id: "data",
    label: "I agree to the processing of my personal data by GIMI Journal for the",
    linkText: "intended use of the app",
    linkHref: "#",
  },
  {
    id: "privacy",
    label: "I have read and understood GIMI Journal's",
    linkText: "Privacy Policy",
    linkHref: "#",
  },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative inline-flex h-7 w-13 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      style={{
        width: "52px",
        height: "28px",
        background: checked
          ? "linear-gradient(90deg, #2c5aa0 0%, #3a6ec4 100%)"
          : "#d1d5db",
        boxShadow: checked ? "0 2px 8px rgba(44,90,160,0.35)" : "none",
        transition: "background 0.2s",
      }}
    >
      <span
        className="pointer-events-none inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out"
        style={{
          width: "22px",
          height: "22px",
          marginTop: "3px",
          marginLeft: checked ? "27px" : "3px",
          transition: "margin-left 0.2s",
        }}
      />
    </button>
  );
}

function ConsentRow({
  item,
  suffix,
  checked,
  onChange,
}: {
  item: ToggleItem;
  suffix?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-xl border border-blue-400 bg-white/70 px-4 py-3.5"
      style={{ backdropFilter: "blur(4px)" }}
    >
      <p className="text-sm text-gray-700 leading-snug">
        {item.label}{" "}
        <a
          href={item.linkHref}
          className="font-medium underline transition hover:opacity-75"
          style={{ color: "#2c5aa0" }}
        >
          {item.linkText}
        </a>
        {suffix && ` ${suffix}`}
      </p>
      <div className="flex-shrink-0">
        <Toggle checked={checked} onChange={onChange} />
      </div>
    </div>
  );
}

export default function ConsentPage() {
    const navigate = useNavigate();
    const [toggles, setToggles] = useState<Record<string, boolean>>({
    disclaimer: true,
    terms: true,
    data: true,
    privacy: true,
  });

  const toggle = (id: string) =>
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  const allChecked = Object.values(toggles).every(Boolean);

    const handleProceed = () => {
    if (!allChecked) return;
    navigate("/onboarding-questions");
    };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background — matches login page exactly */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          background:
            "linear-gradient(135deg, #b8cfe8 0%, #d0e4f5 30%, #a8c4e0 55%, #c5d8ee 75%, #dce9f5 100%)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-1/3"
          style={{
            background:
              "linear-gradient(180deg, rgba(135,195,235,0.5) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Card */}
      <div
        className="relative z-10 bg-white/85 backdrop-blur-md rounded-3xl w-full mx-4 sm:mx-0 sm:w-[480px] mt-16 sm:mt-0 px-8 pt-10 pb-10 sm:px-10 sm:pt-12 sm:pb-12"
        style={{
          boxShadow:
            "0 8px 40px rgba(30, 60, 100, 0.18), 0 2px 8px rgba(30,60,100,0.08)",
        }}
      >
        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 tracking-tight leading-snug">
          Before starting, please read the disclaimers and confirm your consent.
        </h1>

        <div className="space-y-7">
          {/* Privacy Disclaimer Section */}
          <div>
            <p className="text-base font-bold text-gray-900 mb-3">
              GIMI Journal Privacy Disclaimer
            </p>
            <div className="space-y-3">
              {privacyItems.map((item) => (
                <ConsentRow
                  key={item.id}
                  item={item}
                  suffix="to GIMI Journal"
                  checked={toggles[item.id]}
                  onChange={() => toggle(item.id)}
                />
              ))}
            </div>
          </div>

          {/* Mandatory Consent Section */}
          <div>
            <p className="text-base font-bold text-gray-900 mb-3">
              Mandatory Consent for App Usage
            </p>
            <div className="space-y-3">
              {consentItems.map((item) => (
                <ConsentRow
                  key={item.id}
                  item={item}
                  checked={toggles[item.id]}
                  onChange={() => toggle(item.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Proceed Button */}
        <button
        
          onClick={handleProceed}
          disabled={!allChecked}
          className="mt-8 w-full rounded-xl py-3.5 text-white font-semibold text-base sm:text-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(90deg, #2c5aa0 0%, #3a6ec4 100%)",
            boxShadow: allChecked
              ? "0 4px 16px rgba(44, 90, 160, 0.35)"
              : "none",
          }}
        >
          Proceed
        </button>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TermsAndConditions from "../../components/consent-widgets/termsandconditions-modal";
import Disclaimers from "../../components/consent-widgets/disclaimers-modal";
import PrivacyPolicy from "../../components/consent-widgets/privacypolicy-modal";

interface ToggleItem {
  id: string;
  label: string;
  linkText: string;
  onLinkClick?: () => void;
}

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
      className="relative inline-flex flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
        {item.onLinkClick ? (
          <button
            type="button"
            onClick={item.onLinkClick}
            className="font-medium underline transition hover:opacity-75 bg-transparent border-none p-0 cursor-pointer"
            style={{ color: "#2c5aa0" }}
          >
            {item.linkText}
          </button>
        ) : (
          <span className="font-medium" style={{ color: "#2c5aa0" }}>
            {item.linkText}
          </span>
        )}
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

  // All toggles start OFF (false)
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    disclaimer: false,
    terms: false,
    data: false,
    privacy: false,
  });

  const [showTerms, setShowTerms] = useState(false);
  const [showDisclaimers, setShowDisclaimers] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Handle toggle click - if turning ON, show modal; if turning OFF, just toggle
  const handleToggle = (id: string) => {
    const isCurrentlyOff = !toggles[id];
    
    if (isCurrentlyOff) {
      // User is turning the toggle ON - show the respective modal
      switch (id) {
        case "disclaimer":
          setShowDisclaimers(true);
          break;
        case "terms":
          setShowTerms(true);
          break;
        case "privacy":
          setShowPrivacy(true);
          break;
        case "data":
          // No modal for this one yet, just toggle it on
          setToggles((prev) => ({ ...prev, [id]: true }));
          break;
      }
    } else {
      // User is turning the toggle OFF - just toggle it
      setToggles((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Handle modal close - turn on the respective toggle when modal is closed
  const handleDisclaimersClose = () => {
    setShowDisclaimers(false);
    setToggles((prev) => ({ ...prev, disclaimer: true }));
  };

  const handleTermsClose = () => {
    setShowTerms(false);
    setToggles((prev) => ({ ...prev, terms: true }));
  };

  const handlePrivacyClose = () => {
    setShowPrivacy(false);
    setToggles((prev) => ({ ...prev, privacy: true }));
  };

  const allChecked = Object.values(toggles).every(Boolean);

  const handleProceed = () => {
    if (!allChecked) return;
    navigate("/login");
  };

  const privacyItems: ToggleItem[] = [
    {
      id: "disclaimer",
      label: "I have read and understood the",
      linkText: "disclaimers",
      onLinkClick: () => setShowDisclaimers(true),
    },
  ];

  const consentItems: ToggleItem[] = [
    {
      id: "terms",
      label: "I agree to GIMI Journal's",
      linkText: "Terms & Conditions",
      onLinkClick: () => setShowTerms(true),
    },
    {
      id: "data",
      label: "I agree to the processing of my personal data by GIMI Journal for the",
      linkText: "intended use of the app",
      // no modal yet — add onLinkClick when ready
    },
    {
      id: "privacy",
      label: "I have read and understood GIMI Journal's",
      linkText: "Privacy Policy",
      onLinkClick: () => setShowPrivacy(true),
    },
  ];

  return (
    <>
      {/* Modals - toggle turns ON when modal is closed */}
      <TermsAndConditions isOpen={showTerms} onClose={handleTermsClose} />
      <Disclaimers isOpen={showDisclaimers} onClose={handleDisclaimersClose} />
      <PrivacyPolicy isOpen={showPrivacy} onClose={handlePrivacyClose} />

      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background */}
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
                    onChange={() => handleToggle(item.id)}
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
                    onChange={() => handleToggle(item.id)}
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
              boxShadow: allChecked ? "0 4px 16px rgba(44, 90, 160, 0.35)" : "none",
            }}
          >
            Proceed
          </button>
        </div>
      </div>
    </>
  );
}
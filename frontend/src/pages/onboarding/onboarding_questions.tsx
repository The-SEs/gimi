import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GimiIcon from "../../assets/GIMI_Icon.svg";

// ── Types ──────────────────────────────────────────────────────────────────
interface Answers {
  journalingGoal: string;
  journalingFrequency: string;
  contactPreference: string;
  supportAreas: string[];
}

// ── Option Button ──────────────────────────────────────────────────────────
function OptionButton({
  label,
  selected,
  onClick,
  multi,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400"
      style={{
        borderStyle: "solid",
        borderColor: selected ? "#2c5aa0" : "#7D9DC9",
        borderTopWidth: selected ? "2px" : "1px",
        borderLeftWidth: selected ? "2px" : "1px",
        borderRightWidth: selected ? "2px" : "1px",
        borderBottomWidth: "4px",
        background: selected ? "rgba(44,90,160,0.15)" : "rgba(210,235,255,0.30)",
        color: selected ? "#1e3a6e" : "#374151",
        fontWeight: selected ? 700 : 400,
        boxShadow: selected ? "0 4px 16px rgba(44,90,160,0.22)" : "none",
      }}
    >
      <span className="flex items-center justify-center gap-2">
        {multi && (
          <span
            className="inline-flex items-center justify-center rounded-md shrink-0"
            style={{
              width: 16,
              height: 16,
              borderStyle: "solid",
              borderWidth: "1px",
              borderColor: selected ? "#2c5aa0" : "#93c5fd",
              background: selected ? "#2c5aa0" : "transparent",
            }}
          >
            {selected && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M2 5l2.5 2.5L8 3"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        )}
        {label}
      </span>
    </button>
  );
}

// ── Dot Indicators ─────────────────────────────────────────────────────────
function Dots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex justify-center gap-1.5 mt-6">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 8,
            height: 8,
            background:
              i === current
                ? "linear-gradient(90deg,#2c5aa0,#3a6ec4)"
                : "#bfd4ee",
          }}
        />
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function OnboardingQuestions() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    journalingGoal: "",
    journalingFrequency: "",
    contactPreference: "",
    supportAreas: [],
  });

  const doesntWantToJournal = answers.journalingGoal === "I don't want to journal";

  const flow: string[] = doesntWantToJournal
    ? ["welcome", "goal", "words", "contact", "support", "done"]
    : ["welcome", "goal", "frequency", "contact", "support", "done"];

  const totalSlides = flow.length;
  const currentSlide = flow[slideIndex];

  const canProceed = () => {
    switch (currentSlide) {
      case "welcome":   return true;
      case "goal":      return answers.journalingGoal !== "";
      case "frequency": return answers.journalingFrequency !== "";
      case "words":     return true;
      case "contact":   return answers.contactPreference !== "";
      case "support":   return answers.supportAreas.length > 0;
      case "done":      return true;
      default:          return true;
    }
  };

  const next = () => {
    if (slideIndex < totalSlides - 1) setSlideIndex((i) => i + 1);
  };

  const prev = () => {
    if (slideIndex > 0) setSlideIndex((i) => i - 1);
  };

  const toggleSupport = (area: string) => {
    setAnswers((prev) => ({
      ...prev,
      supportAreas: prev.supportAreas.includes(area)
        ? prev.supportAreas.filter((a) => a !== area)
        : [...prev.supportAreas, area],
    }));
  };

  // ── Slide Content ────────────────────────────────────────────────────────
  const renderSlide = () => {
    switch (currentSlide) {
      case "welcome":
        return (
          <div className="flex flex-col items-center text-center gap-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Welcome to GIMI!
            </h1>
            <img src={GimiIcon} alt="GIMI" className="w-28 sm:w-36 my-2 drop-shadow-md" />
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed text-center">
              <p>
                This is a private space for you to journal your thoughts,
                feelings, and experiences. An AI will gently look out for
                patterns that might indicate you're struggling, so our
                counseling team can offer support if needed.
              </p>
              <p>
                Your journal is private by default. Nothing is shared without
                your permission—unless the AI detects serious concerns (like
                self-harm plans).
              </p>
            </div>
            <p className="text-sm font-medium" style={{ color: "#2c5aa0" }}>
              Let's get you set up in 2 minutes!
            </p>
          </div>
        );

      case "goal":
        return (
          <div className="flex flex-col gap-5 text-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight mb-2">
                Journaling is a healthy way to cope and manage your thoughts!
              </h1>
              <p className="text-sm text-gray-600 mt-5 mb-2">
                What's Your Main Goal for Journaling?
              </p>
            </div>
            <div className="space-y-3">
              {[
                "Track my mood and emotions",
                "Reflect on daily experiences",
                "Work through challenges or stressful events",
                "Identify triggers (e.g., situations that upset me)",
                "I don't want to journal",
              ].map((opt) => (
                <OptionButton
                  key={opt}
                  label={opt}
                  selected={answers.journalingGoal === opt}
                  onClick={() => setAnswers((p) => ({ ...p, journalingGoal: opt }))}
                />
              ))}
            </div>
          </div>
        );

      case "frequency":
        return (
          <div className="flex flex-col gap-5 text-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight mb-2">
                Let's build that journaling habit!
              </h1>
              <p className="text-sm text-gray-600 mt-5 mb-2">
                How often do you realistically plan to journal?
              </p>
            </div>
            <div className="space-y-3">
              {[
                "Once a week",
                "Every 3–4 days",
                "Every day",
                "Multiple times a day",
              ].map((opt) => (
                <OptionButton
                  key={opt}
                  label={opt}
                  selected={answers.journalingFrequency === opt}
                  onClick={() => setAnswers((p) => ({ ...p, journalingFrequency: opt }))}
                />
              ))}
            </div>
          </div>
        );

      case "words":
        return (
          <div className="flex flex-col items-center text-center gap-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
              Not really good with words? That's okay!
            </h1>
            <img src={GimiIcon} alt="GIMI" className="w-28 sm:w-36 my-2 drop-shadow-md" />
            <p className="text-sm text-gray-600 leading-relaxed">
              Don't worry Game Changer! You can still use GIMI! We understand
              that not everyone expresses themselves through words. Therefore,
              we added a doodle feature for those who prefer a more artistic
              approach!
            </p>
          </div>
        );

      case "contact":
        return (
          <div className="flex flex-col gap-5 text-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight mb-2">
                We're always ready to give you a helping hand.
              </h1>
              <p className="text-sm text-gray-600 mt-5 mb-2">
                How do you prefer to be contacted when the system identifies a
                potential risk or high-stress pattern?
              </p>
            </div>
            <div className="space-y-3">
              {[
                "In-app message",
                "Counselor reach-out",
                "Scheduled check-in",
                "In-campus approach",
              ].map((opt) => (
                <OptionButton
                  key={opt}
                  label={opt}
                  selected={answers.contactPreference === opt}
                  onClick={() => setAnswers((p) => ({ ...p, contactPreference: opt }))}
                />
              ))}
            </div>
          </div>
        );

      case "support":
        return (
          <div className="flex flex-col gap-5 text-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight mb-2">
                Sometimes, we need a little more help than usual, and that's okay!
              </h1>
              <p className="text-sm text-gray-600 mt-5 mb-2">
                Which areas would you like to receive extra support with?
              </p>
            </div>
            <div className="space-y-3">
              {[
                "Anxiety or constant worry",
                "Feeling sad or hopeless",
                "Struggles with friends/family",
                "Thoughts of self-harm or hurting myself",
                "Stress about school/work",
              ].map((opt) => (
                <OptionButton
                  key={opt}
                  label={opt}
                  selected={answers.supportAreas.includes(opt)}
                  onClick={() => toggleSupport(opt)}
                  multi
                />
              ))}
            </div>
          </div>
        );

      case "done":
        return (
          <div className="flex flex-col items-center text-center gap-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
              You're all set!
            </h1>
            <img src={GimiIcon} alt="GIMI" className="w-28 sm:w-36 my-2 drop-shadow-md" />
            <p className="text-sm text-gray-600 leading-relaxed">
              Thank you for filling up our onboarding questions. Rest assured
              that your answers will be kept strictly confidential. Are you
              ready Game Changer? Let's now proceed to your tutorial!
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const navigate = useNavigate();
  const isLastSlide = slideIndex === totalSlides - 1;

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background — visible on desktop */}
      <div
        className="absolute inset-0"
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

      {/* Card — full screen on mobile, centered card on desktop */}
      <div
        className="relative z-10 bg-white/85 backdrop-blur-md
          w-full min-h-screen flex flex-col
          px-6 pt-10 pb-8
          sm:min-h-0 sm:rounded-3xl sm:w-120 sm:px-10 sm:pt-12 sm:pb-12 sm:flex-none"
        style={{
          boxShadow: "0 8px 40px rgba(30,60,100,0.18), 0 2px 8px rgba(30,60,100,0.08)",
        }}
      >
        {/* Slide content — grows to fill on mobile */}
        <div className="flex-1 flex flex-col justify-between sm:block sm:min-h-80">
          <div>{renderSlide()}</div>

          <div className="mt-8">
            {/* Dot indicators */}
            <Dots total={totalSlides} current={slideIndex} />

            {/* Navigation buttons */}
            <div className="mt-6 flex justify-center gap-3">
              {/* Back button — hidden on first slide */}
              {slideIndex > 0 && (
                <button
                  type="button"
                  onClick={prev}
                  className="w-1/2 rounded-xl py-3.5 font-semibold text-base sm:text-lg transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                  style={{
                    borderStyle: "solid",
                    borderColor: "#7D9DC9",
                    borderTopWidth: "1px",
                    borderLeftWidth: "1px",
                    borderRightWidth: "1px",
                    borderBottomWidth: "4px",
                    background: "rgba(210,235,255,0.30)",
                    color: "#2c5aa0",
                  }}
                >
                  ← Back
                </button>
              )}

              {/* Next / Finish button */}
              <button
                onClick={isLastSlide ? () => navigate("/dashboard") : next}
                disabled={!canProceed()}
                className={`${slideIndex > 0 ? "w-1/2" : "w-full"} rounded-xl py-3.5 text-white font-semibold text-base sm:text-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed`}
                style={{
                  background: "linear-gradient(90deg, #2c5aa0 0%, #3a6ec4 100%)",
                  boxShadow: canProceed() ? "0 4px 16px rgba(44,90,160,0.35)" : "none",
                }}
              >
                {isLastSlide ? "Finish" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import CounselorFlagCard, { type SafetyFlagData } from "./counselorFlagCard" // Adjust import path as needed!

export default function TestFlagPage() {
  // 1. Create fake "mock" data that matches what Django WILL send later
  const mockFlag: SafetyFlagData = {
    id: 1,
    student_name: "John Doe",
    timestamp: new Date().toISOString(), // Just uses current time
    risk_level: "High",
    matched_phrases: ["overwhelming", "give up"],
    flagged_text:
      "I just feel like everything is overwhelming and I want to give up.",
    ai_summary:
      "User expresses feelings of being overwhelmed and a desire to give up, indicating potential distress and a need for immediate support or intervention.",
  }

  // 2. A dummy function just to see if the button works
  const handleReview = (id: number) => {
    alert(`Backend would mark flag #${id} as reviewed now!`)
  }

  return (
    // A nice gray background to help you see the card's shadows and borders
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      {/* 3. Render the card! */}
      <CounselorFlagCard flag={mockFlag} onReview={handleReview} />
    </div>
  )
}

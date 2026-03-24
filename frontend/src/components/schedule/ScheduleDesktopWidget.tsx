import React, { useState, useMemo } from "react";

const ScheduleDesktopWidget: React.FC = () => {
  // --- Date State ---
  const today = useMemo(() => new Date(), []);

  // viewDate controls which month we are looking at
  const [viewDate, setViewDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  // selectedDate is for the highlight
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // --- Sticky Note State ---
  const [notes, setNotes] = useState<string[]>([
    "Don't forget to drink water and take a walk! You're doing great, Abigail! 🌷",
  ]);

  // --- Helper Functions (Requested) ---
  const isToday = (date: Date) => isSameDate(date, today);

  const isSameDate = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const getMonthDays = (currentMonth: Date) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // 1. First day of current month (0=Sun, 6=Sat)
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // 2. Days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 3. Days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Add previous month overflow
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Add next month overflow to complete 42 cells (6 rows)
    const totalCells = 42;
    const nextMonthDaysNeeded = totalCells - days.length;
    for (let i = 1; i <= nextMonthDaysNeeded; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const calendarData = useMemo(() => getMonthDays(viewDate), [viewDate]);

  // --- Handlers ---
  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  // --- Formatting ---
  const monthName = viewDate.toLocaleString("default", { month: "long" });
  const viewYear = viewDate.getFullYear();

  const selectedFullDate = `${selectedDate.toLocaleDateString("default", { weekday: "long" })}, ${selectedDate.toLocaleDateString("default", { month: "short" })} ${selectedDate.getDate()}${getOrdinalSuffix(selectedDate.getDate())}`;

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="relative w-full max-w-[75%] mx-auto bg-[#f0f7ff] p-6 md:p-12 rounded-[40px] shadow-2xl font-sans min-h-[700px]">
      {/* 1. Header Row */}
      <div className="flex justify-between items-center mb-12">
        <h2
          className="text-[#2d5a9e] text-4xl font-bold tracking-tight"
          style={{ fontFamily: '"Gloria Hallelujah", cursive' }}
        >
          Our Schedule
        </h2>
        <span className="text-[#4b8df2] text-xl font-medium">
          {selectedFullDate}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* 2. Left Panel: Calendar */}
        <div className="flex-1">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-8 px-2">
            <h3
              className="text-[#2d5a9e] text-xl font-bold"
              style={{
                fontFamily:
                  '"Liberation Serif", Tinos, "Times New Roman", serif',
              }}
            >
              {monthName} {viewYear}
            </h3>
            <div className="flex space-x-4">
              <button
                onClick={handlePrevMonth}
                className="text-[#4b8df2] hover:bg-blue-100 p-1 rounded-md transition duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={handleNextMonth}
                className="text-[#4b8df2] hover:bg-blue-100 p-1 rounded-md transition duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Days Label Header */}
          <div className="grid grid-cols-7 mb-4">
            {dayLabels.map((l, i) => (
              <div
                key={i}
                className="text-center text-[#9db7e0] font-bold text-sm"
              >
                {l}
              </div>
            ))}
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-7 gap-y-2">
            {calendarData.map(({ date, isCurrentMonth }) => {
              const isSelectedVal = isSameDate(date, selectedDate);
              const isTodayVal = isToday(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`relative h-14 md:h-16 flex items-center justify-center transition-all duration-200
                    ${isCurrentMonth ? "text-[#2d5a9e]" : "text-[#c0d4ed]"}
                    ${isSelectedVal ? "z-10" : "hover:scale-105"}
                  `}
                >
                  {/* Selected Highlight (Blue Square with dot) */}
                  {isSelectedVal && (
                    <div className="absolute inset-0 bg-[#4b8df2] rounded-2xl shadow-lg ring-4 ring-white/10 flex flex-col items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {date.getDate()}
                      </span>
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-1"></div>
                    </div>
                  )}

                  {!isSelectedVal && (
                    <span
                      className={`text-lg font-semibold ${isTodayVal ? "text-[#4b8df2]" : ""}`}
                    >
                      {date.getDate()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Right Panel: Today's Notes */}
        <div className="w-full lg:w-[420px]">
          <h3
            className="text-[#2d5a9e] text-3xl font-bold mb-4"
            style={{
              fontFamily: '"Liberation Serif", Tinos, "Times New Roman", serif',
            }}
          >
            Today's Notes
          </h3>
          <div className="w-full h-[1px] bg-blue-100 mb-8" />

          <div className="space-y-8">
            <EventCard
              time="10:00 AM"
              title="Morning Meditation"
              description="Breathe in, breathe out..."
              type="tape"
            />
            <EventCard
              time="12:30 PM"
              title="Creative Doodle Session"
              description="Maybe draw a tiny whale?"
              type="tape"
            />
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Sticky Note */}
      <div className="mt-16 space-y-8">
        {notes.map((note, index) => (
          <div key={index} className="relative">
            {/* Decorative Tape on dashed box (Only for the first or all? I'll do all for consistency with "looks the same") */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-[#d0e6ff] opacity-80 z-20 shadow-sm rounded-sm" />

            <div className="w-full border-2 border-dashed border-[#c0d4ed] rounded-[32px] p-8 md:p-10 relative bg-white/40 group">
              <p className="text-[#9db7e0] font-bold text-xl mb-4">
                Sticky Note:
              </p>

              <textarea
                className="w-full bg-transparent border-none focus:ring-0 text-[#2d5a9e] text-xl font-medium resize-none overflow-hidden h-24 placeholder:text-[#c0d4ed]"
                value={note}
                onChange={(e) => {
                  const newNotes = [...notes];
                  newNotes[index] = e.target.value;
                  setNotes(newNotes);
                }}
                placeholder="Type your note here..."
                autoFocus={index === notes.length - 1 && index !== 0}
              />
            </div>
          </div>
        ))}

        {/* Floating Add Button (Circular Plus Sign) */}
        <div className="absolute bottom-8 right-8 z-50">
          <button
            onClick={() => setNotes([...notes, ""])}
            className="w-20 h-20 bg-[#4b8df2] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
            aria-label="Add Another Sticky Note"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 transition-transform duration-300 group-hover:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const EventCard: React.FC<{
  time: string;
  title: string;
  description: string;
  type: "pin" | "tape";
}> = ({ time, title, description, type }) => {
  return (
    <div
      className={`relative bg-white rounded-3xl p-6 shadow-sm border border-blue-50/50 hover:shadow-md transition-all duration-300 transform ${type === "pin" ? "rotate-[-1deg]" : "rotate-[1deg]"}`}
    >
      {/* Decoration */}
      {type === "tape" && (
        <div className="absolute -top-4 -right-2 w-16 h-8 bg-[#d0e6ff] opacity-70 rotate-[20deg] shadow-sm rounded-sm" />
      )}

      <p className="text-[#4b8df2] text-xs font-bold uppercase tracking-wider mb-2">
        {time}
      </p>
      <h4 className="text-[#2d5a9e] text-lg font-extrabold mb-1">{title}</h4>
      <p className="text-[#9db7e0] text-sm font-medium leading-snug">
        {description}
      </p>
    </div>
  );
};

export default ScheduleDesktopWidget;

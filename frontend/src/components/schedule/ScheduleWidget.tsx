import React, { useState, useMemo } from 'react';

/**
 * ScheduleWidget - A stateful, mobile-first calendar widget.
 * Features:
 * - Dynamic week generation (Saturday to Friday)
 * - Interactive date selection
 * - Responsive design (Tailwind CSS)
 * - Self-contained
 */
const ScheduleWidget: React.FC = () => {
  // Use current system time as source of truth
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Helper: Format month name
  const monthName = today.toLocaleString('default', { month: 'long' });

  // Helper: Generate the current week dates (Starting on Saturday)
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const current = new Date(today);

    // Day 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // To get back to Saturday:
    // If today is Sat (6), subtract 0.
    // If today is Sun (0), subtract 1.
    // If today is Mon (1), subtract 2.
    const dayOfWeek = current.getDay();
    const daysToSubtract = (dayOfWeek + 1) % 7;

    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(startOfWeek);
      nextDate.setDate(startOfWeek.getDate() + i);
      dates.push(nextDate);
    }
    return dates;
  }, [today]);

  // Utility functions
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const dayLabels = ['S', 'S', 'M', 'T', 'W', 'T', 'F']; // Sat, Sun, Mon, Tue, Wed, Thu, Fri

  return (
    //  <div className="flex justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-0">
    <div className="w-full max-w-md bg-white rounded-3xl shadow-lg overflow-hidden p-6 md:p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-gray-400 font-bold tracking-wider text-sm md:text-base">
          WEEKLY FLOW
        </h2>
        <span className="text-blue-600 font-semibold text-sm md:text-base">
          {monthName}
        </span>
      </div>

      {/* Days of the Week Labels */}
      <div className="grid grid-cols-7 text-center mb-2">
        {dayLabels.map((label, idx) => (
          <div
            key={`${label}-${idx}`}
            className={`text-xs md:text-sm font-bold ${idx < 2 ? 'text-gray-400' : 'text-blue-900 opacity-60'}`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Dates Row */}
      <div className="grid grid-cols-7 text-center mb-8 gap-1 md:gap-2">
        {weekDates.map((date, idx) => {
          const selected = isSelected(date);
          const todayStatus = isToday(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200
                  ${selected
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'bg-blue-50/30 text-gray-900 hover:bg-blue-50'
                }
                  ${todayStatus && !selected ? 'ring-2 ring-blue-200 font-bold' : ''}
                `}
            >
              <span className={`text-sm md:text-lg font-bold ${!selected && idx < 2 ? 'text-gray-300' : ''}`}>
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Event Section */}
      <div className="bg-blue-50/30 rounded-2xl p-4 md:p-6 border border-blue-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Blue accent bar */}
            <div className="w-1.5 h-12 bg-blue-500 rounded-full"></div>

            <div>
              <h3 className="text-gray-900 font-bold text-sm md:text-base">
                Math Counseling
              </h3>
              <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                02:30 PM - Zoom
              </p>
            </div>
          </div>

          <button className="text-gray-300 hover:text-blue-600 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    /* </div> */
  );
};

export default ScheduleWidget;

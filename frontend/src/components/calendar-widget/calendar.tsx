import React, { useState } from "react";

type Day = {
  day: number;
  muted?: boolean;
};

const colorOptions = ["#B3EDD8", "#F9ABAB", "#EDEBB3", "#B3BEED"];

const CalendarWidget: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number>(0);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [dateColors, setDateColors] = useState<{ [day: number]: string }>({});
  const [colorMenuDay, setColorMenuDay] = useState<number | null>(null);

  const handleClick = (day: number, muted?: boolean) => {
    if (muted || day === 0) return;
    setSelectedDay(day);
    setColorMenuDay(day);
  };

  const selectColor = (color: string) => {
    if (colorMenuDay !== null) {
      setDateColors({ ...dateColors, [colorMenuDay]: color });
      setColorMenuDay(null);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
    setColorMenuDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
    setColorMenuDay(null);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (month: number, year: number): Day[] => {
    const firstDay = new Date(year, month, 1).getDay();
    const numDays = new Date(year, month + 1, 0).getDate();
    const days: Day[] = [];
    for (let i = 0; i < firstDay; i++) days.push({ day: 0, muted: true });
    for (let i = 1; i <= numDays; i++) days.push({ day: i });
    return days;
  };

  const days = getDaysInMonth(currentMonth, currentYear);

  return (
    <div className="w-80 p-5 bg-gray-100 rounded-2xl relative font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <button className="text-xl" onClick={prevMonth}>‹</button>
        <span className="font-semibold">{monthNames[currentMonth]} {currentYear}</span>
        <button className="text-xl" onClick={nextMonth}>›</button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 text-gray-500 text-sm mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
          <div key={d} className="text-center">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const selected = !d.muted && d.day === selectedDay;
          const customColor = dateColors[d.day];

          return (
            <div
              key={i}
              onClick={() => handleClick(d.day, d.muted)}
              className={`
                w-9 h-9 flex items-center justify-center rounded-full cursor-pointer
                ${d.muted ? "text-gray-400 cursor-default" : ""}
                ${selected ? "bg-gray-800 text-white font-semibold" : ""}
              `}
              style={{ backgroundColor: customColor ? customColor : undefined, color: customColor ? "#000" : undefined }}
            >
              {d.day !== 0 ? d.day : ""}
            </div>
          );
        })}
      </div>

      {/* Color Menu */}
      {colorMenuDay !== null && (
        <div className="absolute bottom-2 left-5 flex gap-2 p-2 bg-white rounded-lg shadow-md">
          {colorOptions.map(c => (
            <div
              key={c}
              onClick={() => selectColor(c)}
              className="w-7 h-7 rounded-full cursor-pointer"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;
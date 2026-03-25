import { useState } from "react";

type SearchJournalEntryProps = {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
};

export default function SearchJournalEntry({
  className = "",
  placeholder = "Search Journal Entry...",
  onSearch,
}: SearchJournalEntryProps) {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch?.(value);
  };

  return (
    <div className={`w-full max-w-[600px] rounded-full bg-[#e9edf5] px-6 py-4 shadow-sm flex items-center gap-3 ${className}`}>
      <svg className="w-4 h-4 text-[#9aa3af] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent text-[1.2rem] font-medium tracking-[-0.02em] text-[#5f6368] outline-none cursor-text placeholder:text-[#9aa3af]"
      />
    </div>
  );
}

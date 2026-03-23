import { useState } from "react";

type SearchBarProps = {
  className?: string;
  placeholder?: string;
};

export default function SearchBar(
{
  className = "",
  placeholder = "Search Journal Entry...",
}: SearchBarProps) {
  const [value, setValue] = useState("");

  return (
    <div className={`w-full max-w-[600px] rounded-full bg-[#e9edf5] px-6 py-4 shadow-sm ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[1.2rem] font-medium tracking-[-0.02em] text-[#5f6368] outline-none cursor-text placeholder:text-[#9aa3af]"
      />
    </div>
  );
}
import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRightIcon } from "lucide-react";

type GimiChatInputProps = {
  className?: string;
  placeholder?: string;
  onSend?: (message: string) => void;
};

export default function GimiChatInput({
  className = "",
  placeholder = "Type your message...",
  onSend,
}: GimiChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    onSend?.(trimmedValue);
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex min-h-[92px] w-full items-center rounded-[18px] bg-[#d8e7ff] px-5 pr-20 shadow-inner shadow-white/30 ${className}`.trim()}
    >
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[1.05rem] text-[#35528f] placeholder:text-[#7d97ca] outline-none"
      />

      <button
        type="submit"
        className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#5a7dc4] text-white shadow-[0_8px_18px_rgba(90,125,196,0.35)] transition hover:scale-[1.04]"
        aria-label="Send message"
      >
        <ArrowRightIcon className="h-5 w-5" />
      </button>
    </form>
  );
}

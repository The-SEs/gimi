import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import GimiChatInput from "./gimiChatInput.tsx";
import GimiUserChatBubble from "./gimiUserChatBubble.tsx";

type GimiChatWindowProps = {
  className?: string;
  onClose?: () => void;
};

export default function GimiChatWindow({
  className = "",
  onClose,
}: GimiChatWindowProps) {
  const [userMessages, setUserMessages] = useState<string[]>([]);

  const handleSend = (message: string) => {
    setUserMessages((currentMessages) => [...currentMessages, message]);
  };

  return (
    <section
      className={`flex h-[760px] flex-col overflow-hidden rounded-[32px] bg-[#fdfefe]/92 shadow-[0_30px_70px_rgba(111,162,229,0.3)] ring-1 ring-white/65 backdrop-blur-sm ${className}`.trim()}
    >
      <div className="h-10 bg-linear-to-r from-[#f7b2cc] via-[#f9bed2] to-[#f4b5d0]" />

      <div className="flex items-center justify-between px-6 pb-3 pt-4 sm:px-9">
        <div className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full bg-[#cfd3ee]" />
          <span className="h-3.5 w-3.5 rounded-full bg-[#cfd3ee]" />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[#f3a9b7] bg-[#ffd5de] text-[#844250] shadow-[0_10px_20px_rgba(246,160,177,0.32)] transition hover:scale-[1.03]"
          aria-label="Close chat window"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-6 sm:px-9">
        <div className="gimi-jelly-scrollbar mt-2 min-h-0 flex-1 overflow-y-auto rounded-[26px] pr-1">
          <div className="space-y-4 px-1 pb-6">
            {userMessages.map((message, index) => (
              <GimiUserChatBubble
                key={`${index}-${message}`}
                message={message}
              />
            ))}
          </div>
        </div>

        <div className="pb-7 pt-5 sm:pb-8">
          <GimiChatInput onSend={handleSend} />
        </div>
      </div>
    </section>
  );
}

type GimiUserChatBubbleProps = {
  message: string;
  className?: string;
};

export default function GimiUserChatBubble({
  message,
  className = "",
}: GimiUserChatBubbleProps) {
  return (
    <div className={`flex justify-end ${className}`.trim()}>
      <div className="max-w-[78%] rounded-[24px] rounded-br-[10px] bg-[#d8e7ff] px-5 py-4 text-right shadow-[0_12px_28px_rgba(157,188,238,0.22)]">
        <p className="text-[1rem] leading-snug font-medium tracking-[-0.02em] text-[#35528f] sm:text-[1.15rem]">
          {message}
        </p>
      </div>
    </div>
  );
}

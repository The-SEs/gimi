import { useEffect, useMemo, useRef, useState } from "react";

import GimiHeadIcon from "../../assets/gimi_head_icon.svg";

type GimiActionButtonProps = {
  message?: string;
  intervalMs?: number;
  visibleDurationMs?: number;
  initialDelayMs?: number;
  onClick?: () => void;
};

export default function GimiActionButton({
  message = "Need assistance?\nFeel free to click me!",
  intervalMs = 120_000,
  visibleDurationMs = 8_000,
  initialDelayMs = 12_000,
  onClick,
}: GimiActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isAutoVisible, setIsAutoVisible] = useState(false);

  const intervalIdRef = useRef<number | null>(null);
  const hideTimeoutIdRef = useRef<number | null>(null);
  const initialTimeoutIdRef = useRef<number | null>(null);

  const showBubble = isHovered || isFocused || isAutoVisible;

  const messageLines = useMemo(() => message.split("\n"), [message]);

  useEffect(() => {
    const clearHideTimeout = () => {
      if (hideTimeoutIdRef.current === null) return;
      window.clearTimeout(hideTimeoutIdRef.current);
      hideTimeoutIdRef.current = null;
    };

    const showAutoBubble = () => {
      clearHideTimeout();
      setIsAutoVisible(true);

      hideTimeoutIdRef.current = window.setTimeout(() => {
        setIsAutoVisible(false);
        hideTimeoutIdRef.current = null;
      }, visibleDurationMs);
    };

    initialTimeoutIdRef.current = window.setTimeout(showAutoBubble, initialDelayMs);
    intervalIdRef.current = window.setInterval(showAutoBubble, intervalMs);

    return () => {
      if (intervalIdRef.current !== null) window.clearInterval(intervalIdRef.current);
      if (initialTimeoutIdRef.current !== null) window.clearTimeout(initialTimeoutIdRef.current);
      clearHideTimeout();
    };
  }, [initialDelayMs, intervalMs, visibleDurationMs]);

  return (
    <div className="fixed bottom-5 right-5 z-50 sm:bottom-8 sm:right-8 cursor-pointer">
      <div className="flex items-center gap-3">
        <div
          className={[
            "relative max-w-[calc(100vw-140px)] rounded-[18px] border-2 border-[#A9C5FF] bg-[#E6EEF9] px-4 py-3 text-left shadow-[0_18px_45px_rgba(16,24,40,0.22)] sm:max-w-65]",
            "transition-[opacity,transform] duration-250 ease-out will-change-[opacity,transform]",
            showBubble ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2",
            isAutoVisible && !isHovered && !isFocused ? "gimi-alert-bounce" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden={!showBubble}
        >
          <div className="absolute -right-2 top-1/2 hidden h-5 w-5 -translate-y-1/2 rotate-45 border-r-2 border-[#A9C5FF] bg-[#E6EEF9] sm:block" />

          <p className="text-[1.25rem] leading-snug font-medium tracking-[-0.02em] text-[#143D8F]">
            {messageLines.map((line, index) => (
              <span key={`${index}-${line}`} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>

        <button
          type="button"
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={[
            "group relative grid place-items-center rounded-full",
            "hover:scale-[1.10] transition-all ease-in-out active:scale-[0.98]",
          ].join(" ")}
          aria-label="Open GIMI help"
        >
          <img
            src={GimiHeadIcon}
            alt="GIMI"
            className="h-38 w-38 object-contain drop-shadow-[0_12px_22px_rgba(30,64,175,0.22)]"
          />
        </button>
      </div>
    </div>
  );
}

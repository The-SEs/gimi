import AlertIcon from "../../assets/alertIcon.svg";

type GimiChatLauncherProps = {
  className?: string;
  onOpen?: () => void;
};

export default function GimiChatLauncher({
  className = "",
  onOpen,
}: GimiChatLauncherProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`gimi-widget-bounce flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-[#ffd7e4] via-[#dce8ff] to-[#b9d5ff] shadow-[0_18px_36px_rgba(120,160,224,0.28)] ring-1 ring-white/75 transition hover:scale-[1.03] ${className}`.trim()}
      aria-label="Open chat window"
    >
      <img
        src={AlertIcon}
        alt="Open GIMI chat"
        className="h-16 w-16 object-contain"
      />
    </button>
  );
}

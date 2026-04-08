import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface SectionCardProps {
  title: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}

export function SectionCard({
  title,
  icon: Icon,
  actionLabel,
  onAction,
  children,
}: SectionCardProps) {
  return (
    <section className="overflow-hidden rounded-[12px] border border-[#e3e7ef] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <header className="flex items-center justify-between gap-3 bg-[#eef0f4] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-[#5f6673]">
          {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
          <h2 className="text-[0.95rem] font-semibold">{title}</h2>
        </div>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="rounded-md px-2 py-1 text-sm font-semibold text-[#5a7cff] transition hover:bg-white/80 hover:text-[#4768ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5a7cff]"
          >
            {actionLabel}
          </button>
        ) : null}
      </header>
      {children}
    </section>
  );
}

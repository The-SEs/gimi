import journalIcon from "../../assets/journal-icon.svg";

type JournalWidgetProps = {
  className?: string;
};

export default function JournalWidget({ className = "" }: JournalWidgetProps) {
  return (
    <div
      className={`bg-white w-full rounded-xl flex gap-5 px-5 py-3 items-center shadow-sm font-varela ${className}`}
    >
      <div>
        <img src={journalIcon} alt="" />
      </div>
      <div>
        <p className="text-2xl text-GIMI-blue font-semibold">Journal</p>
        <p className="text-sm text-slate-500">Record your day</p>
      </div>
    </div>
  );
}

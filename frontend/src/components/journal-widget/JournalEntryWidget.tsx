import JournalEntry from "../journal/journalEntry.tsx";

type JournalEntryWidgetProps = {
  className?: string;
};

export default function JournalEntryWidget({ className = "" }: JournalEntryWidgetProps) {
  return (
    <div className={className}>
      <JournalEntry />
    </div>
  );
}

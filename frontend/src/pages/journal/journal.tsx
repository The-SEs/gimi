import MoodBoard from "../../components/mood-widget/MoodBoard.tsx";
import SearchJournalEntry from "../../components/journal-widget/SearchJournalEntry.tsx";
import Calendar from "../../components/journal/calendar.tsx";
import GimiHeadIcon from "../../components/gimi-action-button/gimi-button.tsx";

export default function JournalPage() {
  return (
    <div className="mx-auto">
      <div className="sticky z-100 bottom-5 right-5">
        <GimiHeadIcon />
      </div>
      <div className="mx-6 flex flex-col gap-6 lg:flex-row lg:gap-10">
        <div className="flex flex-col gap-6 w-full lg:w-[300px] lg:flex-shrink-0">
          <MoodBoard />
          <SearchJournalEntry />
          <Calendar />
        </div>
      </div>
    </div>
  );
}
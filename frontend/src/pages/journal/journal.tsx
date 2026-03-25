import MoodBoard from "../../components/mood-widget/MoodBoard.tsx";
import SearchJournalEntry from "../../components/journal-widget/SearchJournalEntry.tsx";
import Calendar from "../../components/journal/calendar.tsx";
import GimiHeadIcon from "../../components/gimi-action-button/gimi-button.tsx";
import JournalViewn from "../../components/journal-widget/DailyEntryEditor.tsx";

export default function JournalPage() {
  return (
    <div className="mx-auto">
      <div className="sticky z-100 bottom-5 right-5">
        <GimiHeadIcon />
      </div>

      <div className="mx-6 flex flex-col gap-6 lg:flex-row lg:gap-10">
        <div className="flex flex-col gap-1 w-full lg:w-[350px] lg:flex-shrink-0">
          <div className="w-full rounded-xl p-4">
            <MoodBoard />
          </div>
          <div className="w-full rounded-xl p-4">
            <SearchJournalEntry />
          </div>
          <div className="w-full rounded-xl p-4">
            <Calendar />
          </div>
        </div>

        <div className="flex-1">
          <JournalViewn />
        </div>
      </div>
    </div>
  );
}
import MoodBoard from "../../components/mood-widget/MoodBoard";
import SearchJournalEntry from "../../components/journal-widget/SearchJournalEntry";
import Calendar from "../../components/journal/calendar";
import GimiHeadIcon from "../../components/gimi-action-button/gimi-button";
import DailyEntryEditor from "../../components/journal-widget/DailyEntryEditor";

export default function JournalPage() {
  return (
    <div className="mx-auto">
      <div className="sticky z-100 bottom-5 right-5">
        <GimiHeadIcon />
      </div>

      <div className="mx-6 flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* Sidebar */}
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

        {/* Main editor */}
        <div className="flex-1">
          <DailyEntryEditor />
        </div>
      </div>
    </div>
  );
}

import WelcomeWidget from "../../components/welcome-widget/WelcomeWidget.tsx";
import MoodBoard from "../../components/mood-widget/MoodBoard.tsx";
import JournalWidget from "../../components/journal-widget/JournalWidget.tsx";
import DoodleWidget from "../../components/doodle-widget/doodleWidget.tsx";
import TalkToGimi from "../../components/talk-to-gimi/TalkToGimi.tsx";
import MusicPlayer from "../../components/widget/musicWidget.tsx";
import PictureWidget from "../../components/widget/pictureWidget.tsx";
import ScheduleWidgetDesktop from "../../components/schedule/ScheduleDesktopWidget.tsx";
import ScheduleWidget from "../../components/schedule/ScheduleWidget.tsx";
import GimiHeadIcon from "../../components/gimi-action-button/gimi-button.tsx";
import { useAuth } from "../../hooks/useAuth.ts";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen px-4 py-4 space-y-4 lg:px-6 lg:py-6 lg:space-y-6">
      <div className="fixed z-50 bottom-5 right-5">
        <GimiHeadIcon />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 lg:items-stretch">
        <div className="w-full lg:flex-[2]">
          <WelcomeWidget
            className="h-full"
            name={user?.username || "Student"}
          />
        </div>
        <div className="w-full lg:flex-[1]">
          <MoodBoard className="h-full" />
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <Link to="/journal" className="w-full lg:flex-1 block">
          <JournalWidget className="h-full" />
        </Link>
        <div className="w-full lg:flex-1">
          <DoodleWidget className="h-full" />
        </div>
        <div className="w-full lg:flex-1">
          <TalkToGimi className="h-full" />
        </div>
      </div>

      <div className="lg:hidden">
        <ScheduleWidget />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 lg:items-start">
        <div className="flex flex-row gap-4 lg:flex-col lg:w-56 lg:shrink-0">
          <div className="flex-1 lg:flex-none">
            <MusicPlayer />
          </div>
          <div className="flex-1 lg:flex-none">
            <PictureWidget />
          </div>
        </div>
        <div className="hidden lg:block lg:flex-1">
          <ScheduleWidgetDesktop />
        </div>
      </div>
    </div>
  );
}

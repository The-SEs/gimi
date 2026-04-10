import WelcomeWidget from "../../components/welcome-widget/WelcomeWidget.tsx";
import MoodBoard from "../../components/mood-widget/MoodBoard.tsx";
import JournalWidget from "../../components/journal-widget/JournalWidget.tsx";
import DoodleWidget from "../../components/doodle-widget/doodleWidget.tsx";
import TalkToGimi from "../../components/talk-to-gimi/TalkToGimi.tsx";
import PictureWidget from "../../components/widget/pictureWidget.tsx";
import ScheduleWidget from "../../components/schedule/ScheduleWidget.tsx";
import ScheduleWidgetDesktop from "../../components/schedule/ScheduleDesktopWidget.tsx";
import GimiHeadIcon from "../../components/gimi-action-button/gimi-button.tsx";
import { useAuth } from "../../hooks/useAuth.ts";
import { Link } from "react-router-dom";
import PlaylistManager from "../../components/widget/playlistManager.tsx";

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="mx-auto">
      <div className="sticky z-100 bottom-5 right-5 invisible md:visible lg:visible">
        <GimiHeadIcon />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-x-8 mb-4 items-stretch px-6">
        <WelcomeWidget
          className="w-full sm:w-2/3"
          name={user?.username || "Student"}
        />
        <MoodBoard className="w-full sm:w-1/3" />
      </div>

      <div className="flex flex-col sm:flex-row mb-10 px-4 sm:px-6 gap-4 sm:gap-x-8">
        <Link to="/journal" className="block flex-1">
          <JournalWidget className="h-full" />
        </Link>
        <Link to="/canvas" className="block flex-1">
          <DoodleWidget className="h-full" />
        </Link>
        <Link to="/chat" className="block flex-1">
          <TalkToGimi className="h-full" />
        </Link>
      </div>

      <div className="block lg:hidden mb-4">
        <ScheduleWidget />
      </div>

      <div className="mx-auto flex flex-col lg:flex-row gap-4">
        <div className="grid grid-cols-1 gap-4 mx-4 sm:mx-15 lg:w-auto">
          <PlaylistManager />
          <PictureWidget />
        </div>
        <div className="hidden lg:block lg:flex-1">
          <ScheduleWidgetDesktop />
        </div>
      </div>
    </div>
  );
}

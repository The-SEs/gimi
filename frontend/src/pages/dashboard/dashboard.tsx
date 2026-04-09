import WelcomeWidget from "../../components/welcome-widget/WelcomeWidget.tsx";
import MoodBoard from "../../components/mood-widget/MoodBoard.tsx";
import JournalWidget from "../../components/journal-widget/JournalWidget.tsx";
import DoodleWidget from "../../components/doodle-widget/doodleWidget.tsx";
import TalkToGimi from "../../components/talk-to-gimi/TalkToGimi.tsx";
import PictureWidget from "../../components/widget/pictureWidget.tsx";
import ScheduleWidgetDesktop from "../../components/schedule/ScheduleDesktopWidget.tsx";
import GimiHeadIcon from "../../components/gimi-action-button/gimi-button.tsx";
import { useAuth } from "../../hooks/useAuth.ts";
import { Link } from "react-router-dom";
import PlaylistManager from "../../components/widget/playlistManager.tsx";


export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="mx-auto">
      <div className="sticky z-100 bottom-5 right-5 sm:invisible md:visible lg:visible">
        <GimiHeadIcon />
      </div>
      <div className="flex gap-x-8">
        <WelcomeWidget className="w-2/3" name={user?.username || "Student"} />
        <MoodBoard className="w-1/3" />
      </div>
      <div className="flex flex-row mb-10 px-6 gap-x-8">
        <Link to="/journal" className="block flex-1">
          <JournalWidget />
        </Link>
        <Link to="/canvas" className="block flex-1">
          <DoodleWidget className="h-full" />
        </Link>
        <Link to="/chat" className="block flex-1">
          <TalkToGimi />
        </Link>
      </div>
      <div className="mx-auto lg:flex">
        <div className="grid grid-cols-1 mx-15">
          <PlaylistManager />
          <PictureWidget />
        </div>
        <ScheduleWidgetDesktop />
      </div>
    </div>
  );
}

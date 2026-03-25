import WelcomeWidget from "../../components/welcome-widget/WelcomeWidget.tsx";
import MoodBoard from "../../components/mood-widget/MoodBoard.tsx";
import JournalWidget from "../../components/journal-widget/JournalWidget.tsx";
import DoodleWidget from "../../components/doodle-widget/doodleWidget.tsx";
import TalkToGimi from "../../components/talk-to-gimi/TalkToGimi.tsx";
import MusicPlayer from "../../components/widget/musicWidget.tsx";
import PictureWidget from "../../components/widget/pictureWidget.tsx";
import ScheduleWidgetDesktop from "../../components/schedule/ScheduleDesktopWidget.tsx";
import GimiHeadIcon from "../../components/gimi-action-button/gimi-button.tsx";
import { useAuth } from "../../hooks/useAuth.ts";

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="mx-auto">
      <div className="sticky z-100 bottom-5 right-5">
        <GimiHeadIcon />
      </div>
      <div className="grid grid-cols-2 gap-x-10 mx-auto lg:flex">
        <WelcomeWidget
          className="col-span-2"
          name={user?.username || "Student"}
        />
        <MoodBoard />
        
      </div>
      <div className="flex">
        <div className="mx-6 grid grid-cols-3 gap-x-10 flex-1 lg:flex mb-10">
          <JournalWidget className="flex-1" />
          <DoodleWidget className="flex-1" />
          <TalkToGimi className="flex-1" />
        </div>
      </div>
      <div className="mx-auto lg:flex">
        <div className="grid grid-cols-1 mx-15">
          <MusicPlayer />
          <PictureWidget />
        </div>
        <ScheduleWidgetDesktop />
      </div>
    </div>
  );
}

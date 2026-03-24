import WelcomeWidget from "../../components/welcome-widget/WelcomeWidget.tsx";
import MoodBoard from "../../components/mood-widget/MoodBoard.tsx";
import JournalWidget from "../../components/journal-widget/JournalWidget.tsx";
import GimiChatBubble from "../../components/chat-widget/gimiChatBubble.tsx";
import DoodleWidget from "../../components/doodle-widget/doodleWidget.tsx";
import TalkToGimi from "../../components/talk-to-gimi/TalkToGimi.tsx";
import MusicPlayer from "../../components/widget/musicWidget.tsx";
import PictureWidget from "../../components/widget/pictureWidget.tsx";
import ScheduleWidgetDesktop from "../../components/schedule/ScheduleDesktopWidget.tsx";

export default function Dashboard() {
  return (
    <div className="mx-auto">
      <div className="grid grid-cols-2 gap-x-10 mx-auto lg:flex">
        <WelcomeWidget className="col-span-2" />
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

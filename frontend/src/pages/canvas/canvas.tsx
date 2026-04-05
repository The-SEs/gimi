import SketchbookCanvas from "../../components/canvas-widget/SketchbookCanvas";
import GimiHeadIcon from "../../components/gimi-action-button/gimi-button";
import MoodBoard from "../../components/mood-widget/MoodBoard";
import MusicPlayer from "../../components/widget/musicWidget";
import PictureWidget from "../../components/widget/pictureWidget";

export default function CanvasPage() {
  return (
    <div className="mx-auto">
      <div className="sticky z-100 bottom-5 right-5">
        <GimiHeadIcon />
      </div>

      <div className="mx-6 flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* Sidebar */}
        <div className="flex flex-col gap-1 w-full lg:w-[350px] lg:flex-shrink-0">
          <div className="w-full mt-0">
            <MoodBoard />
          </div>
          <div className="w-full rounded-xl p-4 flex flex-col gap-6 items-center">
            <MusicPlayer />
            <PictureWidget />
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1">
          <SketchbookCanvas />
        </div>
      </div>
    </div>
  );
}

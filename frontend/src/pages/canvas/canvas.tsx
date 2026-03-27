import SketchbookCanvas from "../../components/canvas-widget/SketchbookCanvas.tsx";
import GimiHeadIcon from "../../components/gimi-action-button/gimi-button.tsx";

export default function CanvasPage() {
  return (
    <div className="mx-auto">
      <div className="sticky z-100 bottom-5 right-5">
        <GimiHeadIcon />
      </div>
      <div className="flex justify-center">
        <SketchbookCanvas />
      </div>
    </div>
  );
}


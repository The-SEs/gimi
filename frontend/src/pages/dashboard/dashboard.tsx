import PictureWidget from "../../components/widget/picturewWidget";
const sampleimage = "https://c.files.bbci.co.uk/18696/production/_132509999_gettyimages-827388844.jpg";
import MusicPlayer from "../../components/widget/musicWidget";
const song = "https://music.youtube.com/watch?v=3IUqoyTxEU8&si=zmV_TcSm-CrrOaTl"
const cover ="https://c.files.bbci.co.uk/18696/production/_132509999_gettyimages-827388844.jpg";

export default function Dashboard() {
  return(
    <div className="flex gap-12">
      <PictureWidget image={ sampleimage } title="bleh" />
      <MusicPlayer
        title="Ocean Eyes"
        artist="Billie Eilish"
        src={song}
        cover={cover}
        />
    </div>
  )
}

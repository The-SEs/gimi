import PictureWidget from "../../components/widget/picturewWidget";
const sampleimage = "https://c.files.bbci.co.uk/18696/production/_132509999_gettyimages-827388844.jpg";

export default function Dashboard() {
  return(
    <div>
      <PictureWidget image={ sampleimage } title="bleh" />
    </div>
  )
}

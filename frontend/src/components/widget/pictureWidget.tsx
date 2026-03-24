type PictureProps = {
  image: string;
  title?: string;
};

export default function PictureWidget({ image, title }: PictureProps) {
  return (
    <div>
      {/* Card */}
      <div className="bg-gray-200 p-4 pb-10 shadow-lg w-73 hover:rotate-12 transition-all ease-in-out">
        {/* Image */}
        <div className="w-64 h-64 overflow-hidden bg-black">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>

        {/* Caption */}
        <p className="text-center text-gray-500 mt-4 text-sm">{title}</p>
      </div>
    </div>
  );
}


type PictureProps = {
  image: string;
  title?: string;
};

export default function PictureWidget({ image, title }: PictureProps) {
  return (
    <div className="w-full bg-gray-200 p-4 pb-10 shadow-lg hover:rotate-3 transition-all ease-in-out font-varela">
      <div className="w-full aspect-square overflow-hidden bg-black">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-800" />
        )}
      </div>
      {title && (
        <p className="text-center text-slate-500 mt-4 text-sm">{title}</p>
      )}
    </div>
  );
}

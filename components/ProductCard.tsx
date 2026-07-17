import Image from "next/image";

type ProductCardProps = {
  name: string;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  onAddToCart: () => void;
};

export default function ProductCard({
  name,
  price,
  imageUrl,
  onAddToCart,
  isAvailable,
}: ProductCardProps) {
  return (
    <div
  className="
    group
    overflow-hidden
    rounded-2xl
    border
    border-slate-200
    bg-white
    shadow-sm
    transition-all
    duration-300
    hover:-translate-y-1
    hover:shadow-lg
  "
>

      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          width={400}
          height={220}
          className="
  h-52
  w-full
  object-cover
  transition-transform
  duration-500
  group-hover:scale-105
"
        />
      ) : (
       <div
  className="
    flex
    h-52
    w-full
    items-center
    justify-center
    bg-slate-100
    text-sm
    text-slate-400
  "
>
  <div className="text-center">
    <p className="font-medium">
      אין תמונה
    </p>

    <p className="mt-1 text-xs text-slate-400">
      תמונה תוסף בקרוב
    </p>
  </div>
</div>
      )}

      <div className="p-5">

        <div className="flex items-start justify-between gap-3">

          <h2 className="text-lg font-semibold leading-tight text-slate-900">
            {name}
          </h2>

          <span
            className={`
              shrink-0
              rounded-full
              px-3
              py-1
              text-xs
              font-semibold
              ${
                isAvailable
                  ? "bg-slate-100 text-slate-700"
                  : "bg-slate-200 text-slate-500"
              }
            `}
          >
            {isAvailable ? "זמין" : "לא זמין"}
          </span>

        </div>


        <div className="mt-5 flex items-end justify-between">

          <p className="text-2xl font-bold text-slate-900">
            ₪{price}
          </p>


          <button
            onClick={onAddToCart}
            disabled={!isAvailable}
            className={`
             rounded-xl
px-5
py-2.5
text-sm
font-semibold
transition-all
duration-200
active:scale-95

              ${
                isAvailable
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }
            `}
          >
            {isAvailable ? "הוסף" : "לא זמין"}
          </button>

        </div>

      </div>

    </div>
  );
}
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  category_id: string | null;
};

type Props = {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
};

export default function AdminProductCard({
  product,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div
      className="
        group
        overflow-hidden
        rounded-2xl
        bg-white
        shadow-md
        transition
        hover:-translate-y-1
        hover:shadow-xl
      "
    >

      {/* Image */}
      {product.image_url ? (
        <Image
          src={product.image_url}
          alt={product.name}
          width={400}
          height={160}
          className="h-52 w-full object-cover"
          
        />
      ) : (
        <div className="flex h-52 w-full items-center justify-center bg-slate-200 text-slate-500">
          אין תמונה
        </div>
      )}


      <div className="p-5">

        {/* Name + Status */}
        <div className="flex items-start justify-between gap-3">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {product.name}
            </h2>

        <p className="mt-2 text-2xl font-bold text-slate-900">
              ₪{product.price}
            </p>
          </div>


          <span
            className={`
              rounded-full
              px-3
              py-1
              text-xs
              font-semibold
              ${
                product.is_available
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }
            `}
          >
            {product.is_available ? "זמין" : "לא זמין"}
          </span>

        </div>


        {/* Buttons */}
        <div className="mt-5 flex gap-3">

          <button
            onClick={onEdit}
            className="flex-1 rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            עריכה
          </button>


          <button
            onClick={onDelete}
            className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            מחיקה
          </button>

        </div>

      </div>

    </div>
  );
}
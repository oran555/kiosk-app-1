import { supabase } from "@/lib/supabase";
import ProductList from "@/components/ProductList";

export default async function HomePage() {
  const { data: products } = await supabase
    .from("products")
    .select("*");

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  return (
  <main className="min-h-screen bg-slate-200">
    <div className="mx-auto max-w-7xl">

  <header className="mb-10 rounded-2xl border border-slate-200 bg-white px-10 py-8 shadow-sm">

    <div className="flex items-center justify-between">

      <div className="text-right">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          KIOSK
        </h1>

        <p className="mt-2 text-slate-500">
          מערכת הזמנות
        </p>
      </div>

      <div className="h-16 w-16 rounded-2xl bg-slate-900" />
    </div>

    <div className="mt-8 h-px bg-slate-200" />

    <p className="mt-6 text-lg text-slate-600">
      בחרו את המוצרים הרצויים ושלחו את ההזמנה לקיוסק.
    </p>

  </header>
   
  {products && categories && (
  <ProductList
    products={products}
    categories={categories}
  />
)}
</div>
  </main> 
);
}
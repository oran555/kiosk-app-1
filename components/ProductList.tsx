"use client";
import { supabase } from "@/lib/supabase";
import {  useEffect, useState } from "react";
import ProductCard from "./ProductCard";

type MyOrder = {
  id: string;
  student_name: string;
  total_price: number;
  status: string;
};

type OrderItem = {
  product_name: string;
  product_price: number;
  quantity: number;
};

type Product = {
  id: string;
  name: string;
  price: number;
   is_available: boolean;
   image_url: string | null;
   category_id: string | null;
};
type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type ProductListProps = {
  products: Product[];
  categories: Category[];
};

type Category = {
  id: string;
  name: string;
  display_order: number;
};

export default function ProductList({
  products,
  categories,
}: ProductListProps) {
 const [cartItems, setCartItems] = useState<CartItem[]>([]);
 const [studentName, setStudentName] = useState("");
 const [notes, setNotes] = useState("");
 const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
 const [myOrder, setMyOrder] = useState<MyOrder | null>(null);
 const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
const [isSending, setIsSending] = useState(false);
 
  useEffect(() => {
  const savedOrderId = localStorage.getItem("currentOrderId");

  if (savedOrderId) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentOrderId(savedOrderId);
  }
}, []);

  function addToCart(product: Product) {
  const existingItem = cartItems.find(
    (item) => item.id === product.id
  );

  if (existingItem) {
    setCartItems(
      cartItems.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  } else {
    setCartItems([
      ...cartItems,
      {
        ...product,
        quantity: 1,
      },
    ]);
  }
}
function removeFromCart(productId: string) {
  const existingItem = cartItems.find(
    (item) => item.id === productId
  );

  if (!existingItem) return;

  if (existingItem.quantity === 1) {
    setCartItems(
      cartItems.filter(
        (item) => item.id !== productId
      )
    );
  } else {
    setCartItems(
      cartItems.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
    );
  }
}

function increaseQuantity(productId: string) {
  setCartItems(
    cartItems.map((item) =>
      item.id === productId
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    )
  );
}

const totalPrice = cartItems.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);
async function sendOrder() {
  if (studentName.trim() === "") {
    alert("יש להזין שם");
    return;
  }

  if (cartItems.length === 0) {
    alert("הסל ריק");
    return;
  }

  const { data: order, error } = await supabase
  .from("orders")
  .insert([
  {
    student_name: studentName,
    notes: notes,
    total_price: totalPrice,
    status: "חדשה",
  },
])
  .select()
  .single();

  if (error) {
    console.error(error);
      setIsSending(false);
    alert("שגיאה בשליחת ההזמנה");
    return;
  }
  const orderItems = cartItems.map((item) => ({
  order_id: order.id,
  product_id: item.id,
  product_name: item.name,
  product_price: item.price,
  quantity: item.quantity,
}));

const { error: orderItemsError } = await supabase
  .from("order_items")
  .insert(orderItems);

if (orderItemsError) {
  console.error(orderItemsError);
  setIsSending(false);
  alert("שגיאה בשמירת פריטי ההזמנה");
  return;
}

  alert("ההזמנה נשלחה בהצלחה!");

 setCurrentOrderId(order.id);
 setMyOrder(order);

 
 localStorage.setItem("currentOrderId", order.id);


 
  setCartItems([]);
  setStudentName("");
  setNotes("");
  
}
useEffect(() => {
  if (!currentOrderId) return;

  async function loadMyOrder() {
   const { data } = await supabase
  .from("orders")
  .select("*")
  .eq("id", currentOrderId)
  .single();

if (data) {
  setMyOrder(data);

  if (data.status === "נמסר") {
    localStorage.removeItem("currentOrderId");
    setCurrentOrderId(null);
    setMyOrder(null);
    setOrderItems([]);
    return;
  }
}

const { data: items } = await supabase
  .from("order_items")
  .select("*")
  .eq("order_id", currentOrderId);

setOrderItems(items || []);
  }

  loadMyOrder();

  

  const channel = supabase
    .channel("my-order")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "orders",
      },
      (payload) => {
        if (payload.new.id === currentOrderId) {
        const updatedOrder = payload.new as MyOrder;

setMyOrder(updatedOrder);

if (updatedOrder.status === "נמסר") {
  localStorage.removeItem("currentOrderId");
}
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [currentOrderId]);
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <aside className="order-1 lg:order-2 space-y-6">
    <div className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-2xl font-bold text-slate-900">
        ההזמנה שלי
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        עקבו אחר מצב ההזמנה
      </p>
    </div>

    {myOrder && (
      <span
        className={`rounded-full px-3 py-1 text-sm font-semibold ${
          myOrder.status === "חדשה"
            ? "bg-slate-900 text-white"
            : myOrder.status === "בהכנה"
            ? "bg-amber-100 text-amber-800"
            : myOrder.status === "מוכן"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {myOrder.status}
      </span>
    )}
  </div>

  {!myOrder ? (
    <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <p className="font-medium text-slate-900">
        אין הזמנה פעילה
      </p>

      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        לאחר שליחת הזמנה תוכלו לעקוב אחריה כאן.
      </p>
    </div>
  ) : (
    <>
      <div className="mt-6 rounded-2xl bg-slate-100 p-5">
        <p className="text-sm text-slate-500">
          סך לתשלום
        </p>

        <p className="mt-2 text-3xl font-bold text-slate-900">
          ₪{myOrder.total_price}
        </p>
      </div>

      <div className="my-6 h-px bg-slate-200" />

      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        פריטים
      </h3>

      <div className="space-y-3">
        {orderItems.map((item) => (
          <div
            key={item.product_name}
            className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
          >
            <div>
              <p className="font-semibold text-slate-900">
                {item.product_name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {item.quantity} × ₪{item.product_price}
              </p>
            </div>

            <p className="font-bold text-slate-900">
              ₪{item.product_price * item.quantity}
            </p>
          </div>
        ))}
      </div>
    </>
  )}
</div>
      <div className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-2xl font-bold text-slate-900">
        סל
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {cartItems.length} פריטים
      </p>
    </div>
  </div>

  {cartItems.length === 0 ? (
    <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <p className="font-medium text-slate-900">
        הסל ריק
      </p>

     <p className="mt-2 text-sm leading-relaxed text-slate-500">
        בחרו מוצרים כדי להתחיל הזמנה.
      </p>
    </div>
  ) : (
    <div className="mt-6 space-y-3">
      {cartItems.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-slate-200 p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">
                {item.name}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                ₪{item.price} ליחידה
              </p>
            </div>

            <p className="font-bold text-slate-900">
              ₪{item.price * item.quantity}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center rounded-xl border border-slate-200">
              <button
                onClick={() => removeFromCart(item.id)}
                className="px-4 py-2 text-lg text-slate-600 transition hover:bg-slate-100"
              >
                −
              </button>

              <span className="min-w-10 text-center font-medium">
                {item.quantity}
              </span>

              <button
                onClick={() => increaseQuantity(item.id)}
                className="px-4 py-2 text-lg text-slate-600 transition hover:bg-slate-100"
              >
                +
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}

  <div className="my-6 h-px bg-slate-200" />

  <div className="flex items-center justify-between">
    <span className="text-slate-500">
      סך הכול
    </span>

    <span className="text-2xl font-bold text-slate-900">
      ₪{totalPrice}
    </span>
  </div>

  <div className="mt-6 space-y-4">
    <input
      type="text"
      placeholder="שם"
      value={studentName}
      onChange={(e) => setStudentName(e.target.value)}
      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 text-gray-500"
    />

    <textarea
      placeholder="הערות להזמנה (אופציונלי)"
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 text-gray-500"
    />

    <button
  onClick={sendOrder}
  className="
    w-full
    rounded-xl
    bg-slate-900
    py-4
    text-base
    font-semibold
    text-white
    transition-all
    duration-200
    hover:bg-slate-800
    active:scale-[0.98]
  "
>
      שלח הזמנה • ₪{totalPrice}
    </button>
  </div>
</div>
      </aside>
      <section className="order-2 lg:order-1">
     {categories.map((category) => {
  const categoryProducts = products.filter(
    (product) => product.category_id === category.id
  );

  if (categoryProducts.length === 0) return null;

  return (
  <div
  key={category.id}
  className="
    mb-16
    scroll-mt-24
    animate-in
    fade-in
    slide-in-from-bottom-4
    duration-500
  "
>
     <div className="mb-8">
  <div className="flex items-center gap-4">
    <div className="h-px flex-1 bg-slate-300" />

    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
      {category.name}
    </h2>

    <div className="h-px flex-1 bg-slate-300" />
  </div>

</div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {categoryProducts.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            imageUrl={product.image_url}
            isAvailable={product.is_available}
            onAddToCart={() => addToCart(product)}
          />
        ))}
      </div>
    </div>
  );
})}

     {products.some((product) => !product.category_id) && (
  <div className="mb-10">
   <div className="mb-8">
  <div className="flex items-center gap-4">
    <div className="h-px flex-1 bg-slate-300" />

    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
     ללא קטגוריה
    </h2>

    <div className="h-px flex-1 bg-slate-300" />
  </div>

  
</div>
    
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products
        .filter((product) => !product.category_id)
        .map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            imageUrl={product.image_url}
            isAvailable={product.is_available}
            onAddToCart={() => addToCart(product)}
          />
        ))}
    </div>
  </div>
)}
</section>
    </div>
  );
}
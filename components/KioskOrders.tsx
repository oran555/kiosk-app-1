"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import OrderCard from "@/components/OrderCard";
import Notification from "@/components/Notification";
import { useRef } from "react";

type Order = {
  id: string;
  student_name: string;
  notes: string;
  total_price: number;
  status: string;
  created_at: string;

  order_items: {
    id: string;
    product_name: string;
    quantity: number;
  }[];
  
};

 type OrderColumnProps = {
  title: string;
  orders: Order[];
};

function OrderColumn({
  title,
  orders,
}: OrderColumnProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          {orders.length}
        </span>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
            אין הזמנות
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              orderId={order.id}
              studentName={order.student_name}
              totalPrice={order.total_price}
              status={order.status}
              createdAt={order.created_at}
              notes={order.notes}
              items={order.order_items || []}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function KioskOrders() {
  const router = useRouter();
  const notificationAudio = useRef<HTMLAudioElement | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [notification, setNotification] = useState<{
  message: string;
  type: "success" | "error" | "warning" | "info";
} | null>(null);
 function showNotification(
  message: string,
  type: "success" | "error" | "warning" | "info"
) {
  setNotification({
    message,
    type,
  });

  setTimeout(() => {
    setNotification(null);
  }, 3000);
}

useEffect(() => {
  notificationAudio.current = new Audio("/notification.wav");
  notificationAudio.current.volume = 0.2;
}, []);

useEffect(() => {
  const channel = supabase
    .channel("new-orders")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "orders",
      },
      (payload) => {
        console.log("New order:", payload);

       notificationAudio.current?.play().catch(console.error);

        showNotification(
  "התקבלה הזמנה חדשה!",
  "success"
);
      }
    )
    .subscribe();


  return () => {
    supabase.removeChannel(channel);
  };

}, []);
  async function loadOrders() {
   const { data, error } = await supabase
  .from("orders")
  .select(`
    *,
    order_items (
      id,
      product_name,
      quantity
    )
  `)
      .order("created_at", { ascending: false });

    if (error) {
  console.error(
    "Load orders error:",
    error.message,
    error.details,
    error.hint
  );
  return;
}

  

setOrders(data);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();

    const channel = supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

 const newOrders = orders.filter(
  (order) => order.status === "חדשה"
);

const preparingOrders = orders.filter(
  (order) => order.status === "בהכנה"
);

const readyOrders = orders.filter(
  (order) => order.status === "מוכן"
);

const deliveredOrders = orders.filter(
  (order) => order.status === "נמסר"
);



const activeOrders = [
  ...newOrders,
  ...preparingOrders,
  ...readyOrders,
];


  return (
    <div className="min-h-screen bg-slate-100 p-8">
  <div className="mx-auto max-w-7xl">
     <div className="mb-10">

  <div className="flex items-start justify-between">
{notification && (
  <Notification
    message={notification.message}
    type={notification.type}
    onClose={() => setNotification(null)}
  />
)}
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        לוח הזמנות
      </h1>

      <p className="mt-2 text-slate-500">
        ניהול הזמנות הקיוסק בזמן אמת
      </p>
    </div>


    <div className="flex gap-3">

      <button
        onClick={() => router.push("/kiosk/menu")}
        className="
          rounded-xl
          border
          border-slate-300
          bg-white
          px-5
          py-3
          font-semibold
          text-slate-700
          transition
          hover:bg-slate-50
        "
      >
        ניהול מוצרים
      </button>


      <button
        onClick={logout}
        className="
          rounded-xl
          bg-slate-900
          px-5
          py-3
          font-semibold
          text-white
          transition
          hover:bg-slate-800
        "
      >
        יציאה
      </button>

    </div>

  </div>


</div>

    <div className="space-y-10">

  <section>
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-2xl font-bold text-slate-900">
        הזמנות פעילות
      </h2>

      <span className="text-sm text-slate-500">
        {activeOrders.length} הזמנות
      </span>
    </div>
<div
  className="
    sticky
    top-0
    z-40
    mb-6
    flex
    gap-2
    overflow-x-auto
    rounded-2xl
    bg-white
    p-3
    shadow-sm
  "
>
  <button
    onClick={() =>
      document
        .getElementById("new-orders")
        ?.scrollIntoView({ behavior: "smooth" })
    }
    className="whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2 text-white"
  >
     חדשות
  </button>

  <button
    onClick={() =>
      document
        .getElementById("preparing-orders")
        ?.scrollIntoView({ behavior: "smooth" })
    }
    className="whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2"
  >
    בהכנה
  </button>

  <button
    onClick={() =>
      document
        .getElementById("ready-orders")
        ?.scrollIntoView({ behavior: "smooth" })
    }
    className="whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2"
  >
     מוכן
  </button>
  <button
  onClick={() =>
    document
      .getElementById("delivered-orders")
      ?.scrollIntoView({ behavior: "smooth" })
  }
  className="whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2"
>
   נמסר
</button>
</div>
    <div className="grid gap-6 lg:grid-cols-3">

  <div id="new-orders" className="scroll-mt-24">
    <OrderColumn
      title="חדשות"
      orders={newOrders}
    />
  </div>

  <div id="preparing-orders" className="scroll-mt-24">
    <OrderColumn
      title="בהכנה"
      orders={preparingOrders}
    />
  </div>

  <div id="ready-orders" className="scroll-mt-24">
    <OrderColumn
      title="מוכן"
      orders={readyOrders}
    />
  </div>
<div id="delivered-orders" className="scroll-mt-24">

  <OrderColumn
    title="נמסר"
    orders={deliveredOrders}
  />

</div>
</div>
  </section>

  <section>
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-2xl font-bold text-slate-900">
        היסטוריה
      </h2>

      <span className="text-sm text-slate-500">
        {deliveredOrders.length} הזמנות
      </span>
    </div>

    {deliveredOrders.length === 0 ? (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
        עדיין אין הזמנות שהושלמו
      </div>
    ) : (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-6">
       {[...deliveredOrders]
  .sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  )
  .map((order) => (
    <OrderCard
      key={order.id}
      orderId={order.id}
      studentName={order.student_name}
      totalPrice={order.total_price}
      status={order.status}
      createdAt={order.created_at}
      notes={order.notes}
      items={order.order_items || []}
    />
    
  ))}
  </div>
    )}
  </section>

</div>
      </div>
 </div>
  );
}
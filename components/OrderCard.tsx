"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type OrderCardProps = {
  orderId: string;
  studentName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: {
    id: string;
    product_name: string;
    quantity: number;
  }[];
};

export default function OrderCard({
  orderId,
  studentName,
  totalPrice,
  status,
  createdAt,
  items,
}: OrderCardProps) {
  const [loading, setLoading] = useState(false);

const orderDate = new Date(createdAt + "Z").toLocaleDateString("he-IL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

  const orderTime = new Date(createdAt+"Z").toLocaleTimeString("he-IL", {
  timeZone: "Asia/Jerusalem",
  hour: "2-digit",
  minute: "2-digit",
});


  async function updateStatus() {
    if (loading) return;

    setLoading(true);

    let newStatus = status;

    if (status === "חדשה") {
      newStatus = "בהכנה";
    } else if (status === "בהכנה") {
      newStatus = "מוכן";
    } else if (status === "מוכן") {
      newStatus = "נמסר";
    }

    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
      })
      .eq("id", orderId);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("שגיאה בעדכון ההזמנה");
    }
  }


  async function cancelOrder() {
    const confirmed = confirm("לבטל את ההזמנה?");

    if (!confirmed) return;

    const { error } = await supabase
      .from("orders")
      .update({
        status: "בוטל",
      })
      .eq("id", orderId);

    if (error) {
      console.error(error);
      alert("שגיאה בביטול ההזמנה");
    }
  }


  function getStatusStyle() {
    switch (status) {
      case "חדשה":
        return "bg-slate-900 text-white";

      case "בהכנה":
        return "bg-amber-100 text-amber-700";

      case "מוכן":
        return "bg-blue-100 text-blue-700";

      case "נמסר":
        return "bg-green-100 text-green-700";

      case "בוטל":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  }


  function getActionText() {
    if (status === "חדשה") {
      return "התחל הכנה";
    }

    if (status === "בהכנה") {
      return "סמן כמוכן";
    }

    if (status === "מוכן") {
      return "סמן כנמסר";
    }

    return "";
  }


  return (
    <div className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-6
      shadow-sm
      transition
      hover:shadow-md
    ">

      <div className="flex items-start justify-between">

        <div>
          <h2 className="
            text-2xl
            font-semibold
            text-slate-900
          ">
            {studentName}
          </h2>

          <p className="
            mt-1
            text-m
            text-slate-500
          ">
            {orderDate} • {orderTime}
          </p>
        </div>


        <span className={`
          rounded-full
          px-4
          py-1.5
          text-sm
          font-semibold
          ${getStatusStyle()}
        `}>
          {status}
        </span>

      </div>


      <div className="
        my-6
        border-t
        border-slate-200
      " />


      <div className="space-y-3">

        {items.map((item) => (
          <div
            key={item.id}
            className="
              flex
              justify-between
              text-slate-700
            "
          >

            <span>
              {item.product_name}
            </span>

            <span className="
              font-semibold
            ">
              ×{item.quantity}
            </span>

          </div>
        ))}

      </div>


      <div className="
        mt-6
        border-t
        border-slate-200
        pt-5
      ">

        <p className="
          text-sm
          text-slate-500
        ">
          לתשלום
        </p>

        <p className="
          mt-1
          text-3xl
          font-bold
          text-slate-900
        ">
          ₪{totalPrice}
        </p>

      </div>


      {status !== "נמסר" && status !== "בוטל" && (
        <div className="
          mt-6
          space-y-3
        ">

          <button
            onClick={updateStatus}
            disabled={loading}
            className="
              w-full
              rounded-xl
              bg-slate-900
              py-3
              font-semibold
              text-white
              transition
              hover:bg-slate-800
              disabled:opacity-50
            "
          >
            {loading
              ? "מעדכן..."
              : getActionText()
            }
          </button>


          <button
            onClick={cancelOrder}
            className="
              w-full
              rounded-xl
              border
              border-slate-300
              py-3
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-50
            "
          >
            ביטול הזמנה
          </button>

        </div>
      )}

    </div>
  );
}
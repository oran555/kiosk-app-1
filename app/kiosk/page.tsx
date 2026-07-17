import KioskOrders from "@/components/KioskOrders";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function KioskPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <KioskOrders />;
}
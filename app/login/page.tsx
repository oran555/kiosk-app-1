"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
 async function signIn() {
  setLoading(true);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log("Login result:", data);
  console.log("Login error:", error);

  setLoading(false);

  if (error) {
    alert(error.message);
    return;
  }

  

  router.push("/kiosk");
}

  return (
    <main className="min-h-screen flex items-center justify-center bg-blue-900 px-4">
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 shadow-xl">

        <div className="text-center mb-8">
         

          <h1 className="text-3xl font-bold text-gray-900">
            צוות קיוסק כניסה
          </h1>

          <p className="text-gray-500 mt-2">
            התחבר כדי לראות הזמנות
          </p>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>

          <input
            type="email"
            placeholder="הכנס כתובת אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>

          <input
           type={showPassword ? "text" : "password"}
            placeholder="הכנס סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
          />
          <button
          type="button"
         onClick={() => setShowPassword(!showPassword)}
          className="mt-2 text-blue-600 text-sm"
          >
         {showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
         </button>
        </div>

        <button
          onClick={signIn}
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 py-3 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:bg-gray-400"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </div>
    </main>
  );
}
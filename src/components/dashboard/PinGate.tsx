"use client";

import { useState, useEffect } from "react";
import { verifyPin } from "@/lib/actions";

export default function PinGate() {
  const [unlocked, setUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem("dashboard_unlocked") === "true") {
      setUnlocked(true);
    }
  }, []);

  // Before mount or after unlock, render nothing — dashboard shows through
  if (!mounted || unlocked) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const ok = await verifyPin(pin);
    setIsPending(false);
    if (ok) {
      sessionStorage.setItem("dashboard_unlocked", "true");
      setUnlocked(true);
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-spa-bg">
      <div className="bg-white rounded-2xl border border-spa-border p-10 flex flex-col items-center gap-6 w-80 shadow-sm">
        <div className="text-center">
          <p className="text-spa-muted text-sm font-medium tracking-widest uppercase mb-1">
            Liora Head Spa
          </p>
          <h1 className="text-2xl font-bold text-spa-text">Dashboard</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ""));
              setError(false);
            }}
            placeholder="· · · ·"
            autoFocus
            className={
              "h-14 rounded-xl border-2 text-center text-3xl tracking-[0.5em] font-mono bg-white " +
              "text-spa-text focus:outline-none transition-colors " +
              (error ? "border-red-400" : "border-spa-border focus:border-spa-accent")
            }
          />
          {error && (
            <p className="text-red-500 text-sm text-center -mt-2">Incorrect PIN</p>
          )}
          <button
            type="submit"
            disabled={pin.length !== 4 || isPending}
            className="h-12 rounded-xl bg-spa-accent text-white font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {isPending ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}

import Link from "next/link";
import { getServices } from "@/lib/api";
import DashboardClient from "@/components/dashboard/DashboardClient";
import PinGate from "@/components/dashboard/PinGate";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { services } = await getServices();

  return (
    <div className="min-h-screen bg-spa-bg">
      <PinGate />
      <div className="max-w-3xl mx-auto px-6 py-10 md:px-10 md:py-14">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-spa-muted text-sm font-medium tracking-widest uppercase mb-1">
              Liora Head Spa
            </p>
            <h1 className="text-3xl font-bold text-spa-text">Dashboard</h1>
          </div>
          <Link
            href="/"
            className="text-spa-muted text-sm hover:text-spa-text transition-colors mt-1"
          >
            ← Timer App
          </Link>
        </div>

        <DashboardClient services={services} />
      </div>
    </div>
  );
}

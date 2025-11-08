import { Suspense } from "react";
import { MedicationTable } from "@/components/medication-table";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 font-sans">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-semibold text-slate-900">
          Medication orders
        </h1>
        <Suspense
          fallback={
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          }
        >
          <MedicationTable />
        </Suspense>
      </div>
    </div>
  );
}

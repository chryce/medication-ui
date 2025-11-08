import { MedicationTable } from "@/components/medication-table";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 font-sans">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-semibold text-slate-900">
          Medication orders
        </h1>
        <MedicationTable />
      </div>
    </div>
  );
}

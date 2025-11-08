import type { ColumnId, OptionalColumnConfig } from "@/types/medication";

export const optionalColumnOrder: ColumnId[] = ["contact", "patientTags", "notes"];

export const optionalColumnConfig: Record<ColumnId, OptionalColumnConfig> = {
  contact: {
    label: "Patient contact",
    description: "Primary phone number and patient name.",
    renderCell: (med) => (
      <div className="space-y-1 text-sm">
        <p className="font-medium text-slate-900">
          {med.patient?.fullName ?? "Unknown patient"}
        </p>
        <p className="text-slate-500">{med.contact}</p>
      </div>
    ),
  },
  patientTags: {
    label: "Patient tags",
    description: "Highlight key traits or alerts.",
    renderCell: (med) => (
      <div className="flex flex-wrap gap-2">
        {(med.patient?.tags ?? []).map((tag, index) => (
          <span
            key={`${med.id}-opt-tag-${index}`}
            className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600"
          >
            {tag}
          </span>
        ))}
        {(!med.patient || med.patient.tags.length === 0) && (
          <span className="text-sm text-slate-400">No tags</span>
        )}
      </div>
    ),
  },
  notes: {
    label: "Care notes",
    description: "Internal notes about this order.",
    renderCell: (med) => (
      <p className="text-sm text-slate-600">{med.notes}</p>
    ),
  },
};

export const DEFAULT_VISIBLE_OPTIONAL_COLUMNS: ColumnId[] = [];

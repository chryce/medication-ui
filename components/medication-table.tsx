"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

type Medication = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  date: string;
  doctor: string;
  contact: string;
  notes: string;
  patient?: {
    fullName: string;
    tags: string[];
  };
  color: string;
};

const initialMedications: Medication[] = [
  {
    id: 1,
    name: "Cetirizine",
    dosage: "10mg · Tablets",
    frequency: "Twice a day (BID)",
    duration: "2 weeks · Oral",
    instructions: "Take after meals and avoid acidic food",
    date: "22-10-2021",
    doctor: "Dr. Kumar Shah",
    contact: "+1 (555) 204-1212",
    notes: "Patient reports mild drowsiness if taken before 9am.",
    patient: {
      fullName: "Jannette Somebody",
      tags: ["Hypertensive", "Hypersensitive", "High risk"],
    },
    color: "border-l-4 border-green-500",
  },
  {
    id: 2,
    name: "Paracetamol",
    dosage: "20mg · Vial",
    frequency: "Once a day (OD)",
    duration: "1 day · Injection",
    instructions: "Not recorded",
    date: "22-10-2021",
    doctor: "Dr. Kumar Shah",
    contact: "+1 (555) 204-1212",
    notes: "Administer via IM injection only.",
    patient: {
      fullName: "Jannette Somebody",
      tags: ["Hypertensive"],
    },
    color: "border-l-4 border-red-400",
  },
  {
    id: 3,
    name: "Ethinyl estradiol",
    dosage: "10mg · Tablets",
    frequency: "Twice a day (BID)",
    duration: "2 days · Oral",
    instructions: "Don't take on empty stomach",
    date: "22-10-2021",
    doctor: "Dr. Kumar Shah",
    contact: "+1 (555) 204-1212",
    notes: "Schedule follow-up in three days.",
    patient: {
      fullName: "Jannette Somebody",
      tags: ["Hypertensive", "Hypersensitive", "Allergy: dust"],
    },
    color: "border-l-4 border-blue-500",
  },
  {
    id: 4,
    name: "Ethinyl estradiol",
    dosage: "10mg · Tablets",
    frequency: "Twice a day (BID)",
    duration: "2 days · Oral",
    instructions: "Don't take on empty stomach",
    date: "22-10-2021",
    doctor: "Dr. Kumar Shah",
    contact: "+1 (555) 204-1212",
    notes: "Monitor for nausea.",
    patient: {
      fullName: "Jannette Somebody",
      tags: ["Hypersensitive"],
    },
    color: "border-l-4 border-pink-400",
  },
  {
    id: 5,
    name: "Ethinyl estradiol",
    dosage: "10mg · Tablets",
    frequency: "Twice a day (BID)",
    duration: "2 days · Oral",
    instructions: "Don't take on empty stomach",
    date: "22-10-2021",
    doctor: "Dr. Kumar Shah",
    contact: "+1 (555) 204-1212",
    notes: "Evening dose preferred.",
    patient: {
      fullName: "Jannette Somebody",
      tags: ["Hypertensive"],
    },
    color: "border-l-4 border-green-500",
  },
];

type IconName =
  | "search"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "filter"
  | "columns"
  | "ellipsis"
  | "checkbox"
  | "checkbox-checked"
  | "checkbox-indeterminate"
  | "edit"
  | "export"
  | "archive"
  | "chevron-right-small";

type ColumnId = "contact" | "patientTags" | "notes";

const optionalColumnOrder: ColumnId[] = ["contact", "patientTags", "notes"];

const optionalColumnConfig: Record<
  ColumnId,
  {
    label: string;
    description: string;
    renderCell: (med: Medication) => ReactNode;
  }
> = {
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

const DEFAULT_VISIBLE_OPTIONAL_COLUMNS: ColumnId[] = [];

type IconProps = {
  name: IconName;
  alt?: string;
  size?: number;
  className?: string;
};

function Icon({ name, alt = "", size = 16, className }: IconProps) {
  return (
    <Image
      src={`/icons/${name}.svg`}
      alt={alt}
      width={size}
      height={size}
      aria-hidden={alt ? undefined : true}
      className={className}
    />
  );
}

type CheckboxProps = {
  checked?: boolean;
  indeterminate?: boolean;
  onToggle: () => void;
  label?: string;
};

function SelectionCheckbox({
  checked,
  indeterminate,
  onToggle,
  label,
}: CheckboxProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = Boolean(indeterminate && !checked);
    }
  }, [indeterminate, checked]);

  const iconName: IconName = indeterminate
    ? "checkbox-indeterminate"
    : checked
      ? "checkbox-checked"
      : "checkbox";

  return (
    <label className="relative inline-flex h-6 w-6 cursor-pointer items-center justify-center focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-500">
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        aria-label={label}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      <Icon name={iconName} />
    </label>
  );
}

export function MedicationTable() {
  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [pendingEdits, setPendingEdits] = useState<Record<number, Medication>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingCells, setEditingCells] = useState<Record<number, EditableField[]>>({});
  const [visibleOptionalColumns, setVisibleOptionalColumns] = useState<ColumnId[]>(
    DEFAULT_VISIBLE_OPTIONAL_COLUMNS,
  );
  const [showColumnConfigurator, setShowColumnConfigurator] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);


  const toggleRowSelection = (id: number) => {
    setSelectedIds((prev) => {
      const isSelected = prev.includes(id);
      const updatedSelection = isSelected
        ? prev.filter((item) => item !== id)
        : [...prev, id];

      if (isSelected) {
        setPendingEdits((prevEdits) => {
          const rest = { ...prevEdits };
          delete rest[id];
          return rest;
        });
        setEditingCells((prevCells) => {
          const rest = { ...prevCells };
          delete rest[id];
          return rest;
        });
      } else if (isEditing) {
        const medication = medications.find((med) => med.id === id);
        if (medication) {
          setPendingEdits((prevEdits) => ({
            ...prevEdits,
            [id]: { ...medication },
          }));
        }
      }

      if (updatedSelection.length === 0) {
        setIsEditing(false);
        setPendingEdits({});
        setEditingCells({});
      }

      return updatedSelection;
    });
  };

  const toggleAllRows = () => {
    if (medications.length === 0) return;
    if (selectedIds.length === medications.length) {
      setSelectedIds([]);
      setPendingEdits({});
      setIsEditing(false);
      setEditingCells({});
      return;
    }
    const allIds = medications.map((med) => med.id);
    setSelectedIds(allIds);
    if (isEditing) {
      const edits: Record<number, Medication> = {};
      medications.forEach((med) => {
        edits[med.id] = { ...med };
      });
      setPendingEdits(edits);
    }
  };

  type EditableField = "name" | "dosage" | "frequency" | "duration" | "instructions";

  const ensureDraftRow = (id: number) => {
    setPendingEdits((prev) => {
      if (prev[id]) return prev;
      const data = medications.find((med) => med.id === id);
      if (!data) return prev;
      return { ...prev, [id]: { ...data } };
    });
  };

  const setCellEditing = (id: number, field: EditableField, enabled: boolean) => {
    setEditingCells((prev) => {
      const current = new Set(prev[id] ?? []);
      if (enabled) {
        current.add(field);
      } else {
        current.delete(field);
      }
      const values = Array.from(current);
      if (values.length === 0) {
        const rest = { ...prev };
        delete rest[id];
        return rest;
      }
      return { ...prev, [id]: values };
    });
  };

  const handleFieldChange = (
    id: number,
    field: EditableField,
    value: string,
  ) => {
    setPendingEdits((prev) => {
      const base = prev[id] ?? medications.find((med) => med.id === id);
      if (!base) return prev;
      return {
        ...prev,
        [id]: {
          ...base,
          [field]: value,
        },
      };
    });
  };

  const startCellEdit = (id: number, field: EditableField) => {
    if (!isEditing || !selectedIds.includes(id)) return;
    ensureDraftRow(id);
    setCellEditing(id, field, true);
  };

  const stopCellEdit = (id: number, field: EditableField) => {
    setCellEditing(id, field, false);
  };

  const handleEditableKeyDown = (
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: number,
    field: EditableField,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      (event.target as HTMLInputElement).blur();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setPendingEdits((prev) => {
        const draft = prev[id];
        const original = medications.find((med) => med.id === id);
        if (!draft || !original) return prev;
        return {
          ...prev,
          [id]: {
            ...draft,
            [field]: original[field],
          },
        };
      });
      stopCellEdit(id, field);
    }
  };

  const renderEditableLine = (
    id: number,
    field: EditableField,
    value: string,
    options?: { multiline?: boolean; textClass?: string },
  ) => {
    const { multiline = false, textClass = "" } = options ?? {};
    const isSelected = selectedIds.includes(id);
    const isFieldEditing = editingCells[id]?.includes(field);
    const source =
      pendingEdits[id] ?? medications.find((med) => med.id === id);
    const currentValue =
      isEditing && isSelected && source ? source[field] : value;

    if (!isEditing || !isSelected) {
      const Element = multiline ? "div" : "p";
      return <Element className={textClass}>{value}</Element>;
    }

    if (isFieldEditing) {
      if (multiline) {
        return (
          <textarea
            className={`w-full rounded-2xl border border-indigo-200 bg-white/90 px-3 py-2 text-sm text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${textClass}`}
            value={currentValue}
            rows={2}
            onChange={(event) =>
              handleFieldChange(id, field, event.target.value)
            }
            onBlur={() => stopCellEdit(id, field)}
            onKeyDown={(event) => handleEditableKeyDown(event, id, field)}
          />
        );
      }
      return (
        <input
          className={`w-full rounded-2xl border border-indigo-200 bg-white/90 px-3 py-2 text-sm text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${textClass}`}
          value={currentValue}
          onChange={(event) =>
            handleFieldChange(id, field, event.target.value)
          }
          onBlur={() => stopCellEdit(id, field)}
          onKeyDown={(event) => handleEditableKeyDown(event, id, field)}
        />
      );
    }

    const Wrapper = multiline ? "div" : "p";

    return (
      <Wrapper className={`group flex items-center gap-1 ${textClass}`}>
        <span className="flex-1 whitespace-pre-line">{currentValue}</span>
        <button
          type="button"
          onClick={() => startCellEdit(id, field)}
          className="rounded-full p-1 text-indigo-500 opacity-0 transition hover:bg-indigo-50 group-hover:opacity-100"
        >
          <Icon name="edit" className="h-3.5 w-3.5" />
        </button>
      </Wrapper>
    );
  };

  const handleDismissEdits = () => {
    setIsEditing(false);
    setPendingEdits({});
    setEditingCells({});
  };

  const handleSaveChanges = () => {
    if (Object.keys(pendingEdits).length === 0) {
      setIsEditing(false);
      setEditingCells({});
      return;
    }
    setMedications((prev) =>
      prev.map((med) =>
        pendingEdits[med.id] ? { ...pendingEdits[med.id] } : med,
      ),
    );
    setPendingEdits({});
    setEditingCells({});
    setIsEditing(false);
    alert("Changes saved");
  };

  const handleStartEditing = () => {
    if (selectedIds.length === 0) return;
    const edits: Record<number, Medication> = {};
    medications.forEach((med) => {
      if (selectedIds.includes(med.id)) {
        edits[med.id] = { ...med };
      }
    });
    setPendingEdits(edits);
    setEditingCells({});
    setIsEditing(true);
  };

  const handleToggleColumnVisibility = (column: ColumnId) => {
    setVisibleOptionalColumns((prev) => {
      if (prev.includes(column)) {
        return prev.filter((item) => item !== column);
      }
      const next = [...prev, column];
      return optionalColumnOrder.filter((col) => next.includes(col));
    });
  };

  const handleResetColumns = () => {
    setVisibleOptionalColumns(DEFAULT_VISIBLE_OPTIONAL_COLUMNS);
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const allSelected = selectedIds.length === medications.length;
  const indeterminate =
    selectedIds.length > 0 && selectedIds.length < medications.length;
  const selectionCount = selectedIds.length;
  const selectionLabel =
    selectionCount === 1 ? "item selected" : "items selected";

  const SkeletonRow = () => (
    <tr className="border-t border-slate-100">
      <td className="px-6 py-4">
        <div className="h-4 w-4 rounded border border-slate-200 bg-slate-100" />
      </td>
      <td className="py-4">
        <div className="mb-2 h-4 w-32 rounded bg-slate-100" />
        <div className="flex gap-2">
          <div className="h-3 w-20 rounded bg-slate-100" />
          <div className="h-3 w-12 rounded bg-slate-100" />
        </div>
      </td>
      <td className="py-4">
        <div className="mb-2 h-4 w-36 rounded bg-slate-100" />
        <div className="h-3 w-24 rounded bg-slate-100" />
      </td>
      <td className="py-4">
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="mt-2 h-3 w-3/4 rounded bg-slate-100" />
      </td>
      <td className="px-4 py-4 text-right">
        <div className="ml-auto h-4 w-24 rounded bg-slate-100" />
        <div className="ml-auto mt-2 h-3 w-20 rounded bg-slate-100" />
      </td>
      {visibleOptionalColumns.map((column) => (
        <td key={`skeleton-${column}`} className="px-4 py-4">
          <div className="h-3 w-full rounded bg-slate-100" />
        </td>
      ))}
    </tr>
  );

  const activeOptionalColumns = optionalColumnOrder.filter((column) =>
    visibleOptionalColumns.includes(column),
  );
  const hiddenOptionalColumns = optionalColumnOrder.filter(
    (column) => !visibleOptionalColumns.includes(column),
  );

  const primaryColumnLabels = [
    "Selection",
    "Medication",
    "Frequency",
    "Additional instructions",
    "Date",
  ];

  return (
    <>
      <section className="w-full rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 pb-4 pt-5 md:flex-row md:items-center md:justify-between">
        <label className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 focus-within:border-slate-400">
          <Icon name="search" alt="Search" />
          <input
            placeholder="Search"
            className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
            Sort by <Icon name="chevron-down" />
          </button>
          <button className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
            <Icon name="filter" alt="Filter icon" size={18} />
            Filter
          </button>
          <button
            type="button"
            onClick={() => setShowColumnConfigurator(true)}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
          >
            <Icon name="columns" alt="Columns icon" size={18} />
            Configure columns
          </button>
        </div>
      </div>
      {selectionCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 bg-indigo-50 px-6 py-4 text-sm">
          <div className="flex items-center gap-3 text-indigo-700">
            <Icon name="checkbox-indeterminate" />
            <span className="font-medium">
              <span className="text-base font-semibold">
                {selectionCount}
              </span>{" "}
              {selectionLabel}
            </span>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDismissEdits}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Save changes
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleStartEditing}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                <Icon name="edit" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => alert("Export action coming soon")}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                <Icon name="export" />
                Export
              </button>
              <button
                type="button"
                onClick={() => alert("Archive action coming soon")}
                className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 font-medium text-red-600 shadow-sm transition hover:bg-red-100"
              >
                <Icon name="archive" />
                Archive
              </button>
            </div>
          )}
        </div>
      )}
      <div className="max-w-full overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="w-12 px-6 py-3">
                <SelectionCheckbox
                  checked={allSelected}
                  indeterminate={indeterminate}
                  onToggle={toggleAllRows}
                  label="Select all medications"
                />
              </th>
              <th className="px-4 py-3">Medication</th>
              <th className="px-4 py-3">Frequency</th>
              <th className="px-4 py-3">Additional instructions</th>
              <th className="px-4 py-3 text-right pr-10">Date</th>
              {visibleOptionalColumns.map((column) => (
                <th key={`header-${column}`} className="px-4 py-3 text-left">
                  {optionalColumnConfig[column].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonRow key={`skeleton-${index}`} />
                ))
              : medications.flatMap((med) => {
                  const isSelected = selectedIds.includes(med.id);
                  const isExpanded = expandedIds.includes(med.id);
                  const baseRow = (
                    <tr
                      key={med.id}
                      className={`border-t border-slate-100 text-slate-900 last:border-b-0 ${med.color} ${isSelected ? "bg-indigo-50 hover:bg-indigo-100" : "hover:bg-slate-50"}`}
                    >
                      <td className="px-6 py-4 align-top">
                        <SelectionCheckbox
                          checked={isSelected}
                          onToggle={() => toggleRowSelection(med.id)}
                          label={`Select ${med.name}`}
                        />
                      </td>
                      <td className="py-3 align-top">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-indigo-100 bg-white p-1 text-indigo-600 transition hover:bg-indigo-50"
                            onClick={() => toggleExpand(med.id)}
                            aria-label={
                              isExpanded
                                ? `Collapse details for ${med.name}`
                                : `Expand details for ${med.name}`
                            }
                          >
                            <Icon
                              name="chevron-right-small"
                              className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                            />
                          </button>
                          <div className="w-full space-y-1">
                            {renderEditableLine(med.id, "name", med.name, {
                              textClass: "font-medium text-slate-900",
                            })}
                            {renderEditableLine(med.id, "dosage", med.dosage, {
                              textClass: "text-sm text-slate-500",
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 align-top">
                        <div className="space-y-1">
                          {renderEditableLine(med.id, "frequency", med.frequency, {
                            textClass: "font-medium text-slate-800",
                          })}
                          {renderEditableLine(med.id, "duration", med.duration, {
                            textClass: "text-sm text-slate-500",
                          })}
                        </div>
                      </td>
                      <td className="py-3 align-top text-slate-700">
                        {renderEditableLine(med.id, "instructions", med.instructions, {
                          multiline: true,
                          textClass: "text-slate-700 w-full",
                        })}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start justify-end gap-3">
                          <div className="text-right">
                            <p className="font-medium text-slate-800">{med.date}</p>
                            <p className="text-sm text-slate-500">{med.doctor}</p>
                          </div>
                          <button
                            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            aria-label={`More options for ${med.name}`}
                          >
                            <Icon name="ellipsis" />
                          </button>
                        </div>
                      </td>
                      {visibleOptionalColumns.map((column) => (
                        <td key={`${med.id}-${column}`} className="px-4 py-3 align-top">
                          {optionalColumnConfig[column].renderCell(med)}
                        </td>
                      ))}
                    </tr>
                  );

                  if (!isExpanded) return [baseRow];

                  return [
                    baseRow,
                    <tr key={`${med.id}-details`} className="border-t border-slate-100 bg-slate-50">
                      <td />
                      <td colSpan={4 + visibleOptionalColumns.length} className="py-4">
                        <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-3">
                          <div>
                            <p className="text-xs uppercase text-slate-400">Full name</p>
                            <p className="mt-2 font-medium text-slate-900">
                              {med.patient?.fullName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-slate-400">
                              Prescribed by
                            </p>
                            <p className="mt-2 font-medium text-slate-900">
                              {med.doctor}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-slate-400">Patient tags</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                className="flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-indigo-600 hover:border-indigo-300"
                              >
                                <span className="text-base leading-none text-indigo-600">
                                  +
                                </span>
                                Add patient tag
                              </button>
                              {med.patient?.tags.map((tag, index) => (
                                <span
                                  key={`${med.id}-tag-${index}`}
                                  className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>,
                  ];
                })}
          </tbody>
        </table>
      </div>
      <footer className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-sm text-slate-600">
        <p>Showing 1-20 of 36</p>
        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500">
            <span className="sr-only">Previous page</span>
            <Icon name="chevron-left" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500">
            <span className="sr-only">Next page</span>
            <Icon name="chevron-right" />
          </button>
        </div>
      </footer>
    </section>
      {showColumnConfigurator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="column-config-title"
            className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2
                  id="column-config-title"
                  className="text-xl font-semibold text-slate-900"
                >
                  Configure table columns
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Toggle optional insights to customize this table. Changes apply
                  immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowColumnConfigurator(false)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close column configurator"
              >
                x
              </button>
            </div>
            <div className="grid gap-6 border-b border-slate-100 px-6 py-6 md:grid-cols-2">
              <section>
                <h3 className="text-sm font-semibold text-slate-700">
                  Always visible
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Core columns cannot be hidden.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {primaryColumnLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-slate-700">
                  Optional columns
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Click to show or hide extra patient context.
                </p>
                <div className="mt-3 flex flex-col gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Visible
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activeOptionalColumns.length === 0 && (
                        <span className="rounded-2xl border border-dashed border-slate-200 px-3 py-1 text-xs text-slate-400">
                          No optional columns visible
                        </span>
                      )}
                      {activeOptionalColumns.map((column) => (
                        <button
                          key={`visible-${column}`}
                          type="button"
                          onClick={() => handleToggleColumnVisibility(column)}
                          className="flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                        >
                          :: {optionalColumnConfig[column].label}
                          <span aria-hidden className="text-sm">
                            x
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Hidden
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {hiddenOptionalColumns.length === 0 && (
                        <span className="rounded-2xl border border-dashed border-slate-200 px-3 py-1 text-xs text-slate-400">
                          No hidden columns
                        </span>
                      )}
                      {hiddenOptionalColumns.map((column) => (
                        <button
                          key={`hidden-${column}`}
                          type="button"
                          onClick={() => handleToggleColumnVisibility(column)}
                          className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-indigo-200 hover:text-indigo-700"
                        >
                          :: {optionalColumnConfig[column].label}
                          <span className="text-xs text-slate-400">
                            (add)
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div className="flex flex-col gap-4 px-6 py-5">
              <button
                type="button"
                onClick={handleResetColumns}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Reset to defaults
              </button>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowColumnConfigurator(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setShowColumnConfigurator(false)}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

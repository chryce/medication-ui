"use client";

import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/toast";
import type { ColumnId, Medication } from "@/types/medication";
import { Icon } from "@/components/ui/icon";
import { SelectionCheckbox } from "@/components/medication/selection-checkbox";
import {
  DEFAULT_VISIBLE_OPTIONAL_COLUMNS,
  optionalColumnConfig,
  optionalColumnOrder,
} from "@/components/medication/optional-columns";
import { ColumnConfigurator } from "@/components/medication/column-configurator";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { Pagination } from "@/components/ui/pagination";

type EditableField = "name" | "dosage" | "frequency" | "duration" | "instructions";
const DEFAULT_API_ENDPOINT =
  process.env.NEXT_PUBLIC_MEDICATIONS_ENDPOINT ?? "/api/medications";
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE = 350;

export function MedicationTable() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const initialPage = Number(searchParams.get("page") ?? "1") || 1;
  const initialSearch = searchParams.get("search") ?? "";

  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [pendingEdits, setPendingEdits] = useState<Record<number, Medication>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingCells, setEditingCells] = useState<Record<number, EditableField[]>>({});
  const [visibleOptionalColumns, setVisibleOptionalColumns] = useState<ColumnId[]>(
    DEFAULT_VISIBLE_OPTIONAL_COLUMNS,
  );
  const [saveForTeam, setSaveForTeam] = useState(true);
  const { showToast } = useToast();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [totalCount, setTotalCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const startEntry = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry = totalCount === 0 ? 0 : Math.min(startEntry + medications.length - 1, totalCount);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch(
          `${DEFAULT_API_ENDPOINT}?page=${page}&pageSize=${PAGE_SIZE}&search=${encodeURIComponent(
            searchQuery,
          )}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Failed to fetch medications");
        const result: { data: Medication[]; total: number } = await response.json();
        setMedications(result.data);
        setTotalCount(result.total ?? result.data.length);
        setSelectedIds([]);
        setPendingEdits({});
        setEditingCells({});
        setExpandedIds([]);
        setIsEditing(false);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error(error);
          setMedications([]);
          setTotalCount(0);
          setSelectedIds([]);
          setPendingEdits({});
          setEditingCells({});
          setExpandedIds([]);
          setIsEditing(false);
          setErrorMessage("Unable to load medication orders. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [page, searchQuery]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [page, searchQuery, pathname, router]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    const paramPage = Number(searchParams.get("page") ?? "1") || 1;
    const paramSearch = searchParams.get("search") ?? "";
    setPage(paramPage);
    setSearchInput(paramSearch);
    setSearchQuery(paramSearch);
  }, [searchParams]);

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

    if (!isEditing || !isSelected) {
      const Element = multiline ? "div" : "p";
      return <Element className={textClass}>{value}</Element>;
    }

    const Wrapper = multiline ? "div" : "p";

    return (
      <Wrapper className={`flex items-start gap-2 ${textClass}`}>
        <button
          type="button"
          onClick={() => startCellEdit(id, field)}
          className="rounded-full p-1 text-indigo-500 transition hover:bg-indigo-50"
          aria-label={`Edit ${field}`}
        >
          <Icon name="pencil-blue" className="h-3.5 w-3.5" />
        </button>
        <span className="flex-1 whitespace-pre-line">{currentValue}</span>
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
    showToast("Changes saved");
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
    setVisibleOptionalColumns((prev) =>
      prev.includes(column)
        ? prev.filter((item) => item !== column)
        : optionalColumnOrder.filter((col) => [...prev, column].includes(col)),
    );
  };

  const handleResetColumns = () => {
    setVisibleOptionalColumns(DEFAULT_VISIBLE_OPTIONAL_COLUMNS);
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const allSelected =
    medications.length > 0 && selectedIds.length === medications.length;
  const indeterminate =
    selectedIds.length > 0 && selectedIds.length < medications.length;
  const selectionCount = selectedIds.length;
  const selectionLabel =
    selectionCount === 1 ? "item selected" : "items selected";

  const activeOptionalColumns = optionalColumnOrder.filter((column) =>
    visibleOptionalColumns.includes(column),
  );
  const hiddenOptionalColumns = optionalColumnOrder.filter(
    (column) => !visibleOptionalColumns.includes(column),
  );

  return (
    <>
      <section className="w-full rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-4 pb-4 pt-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <label
            className={`flex flex-1 max-w-lg items-center gap-3 rounded-2xl border px-4 py-2 text-sm text-slate-500 transition ${
              searchInput ? "border-indigo-500 bg-white" : "border-slate-200 bg-slate-50"
            } focus-within:border-indigo-400`}
          >
            <Icon name="search" alt="Search" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search medication orders"
              className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
            />
            <div className="flex h-6 w-6 items-center justify-center">
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-slate-200"
                  aria-label="Clear search text"
                >
                  ✕
                </button>
              )}
            </div>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 sm:text-sm">
              Sort by <Icon name="chevron-down" />
            </button>
            <button className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 sm:text-sm">
              <Icon name="filter" alt="Filter icon" size={18} />
              Filter
            </button>
            <button
              type="button"
              onClick={() => setIsConfigOpen(true)}
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
          <table className="w-full min-w-[920px] border-collapse text-sm">
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
              {isLoading && (
                <SkeletonTable
                  optionalColumns={visibleOptionalColumns.length}
                />
              )}

              {!isLoading && errorMessage && (
                <tr>
                  <td
                    colSpan={5 + visibleOptionalColumns.length}
                    className="py-10 text-center text-sm text-rose-500"
                  >
                    {errorMessage}
                  </td>
                </tr>
              )}

              {!isLoading && !errorMessage && medications.length === 0 && (
                <tr>
                  <td
                    colSpan={5 + visibleOptionalColumns.length}
                    className="py-10 text-center text-sm text-slate-500"
                  >
                    No medication orders found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !errorMessage &&
                medications.length > 0 &&
                medications.flatMap((med) => {
                  const isSelected = selectedIds.includes(med.id);
                  const isExpanded = expandedIds.includes(med.id);

                  const baseRow = (
                    <tr
                      key={med.id}
                      className={`border-t border-slate-100 text-slate-900 last:border-b-0 ${
                        med.color
                      } ${
                        isSelected
                          ? "bg-indigo-50 hover:bg-indigo-100"
                          : "hover:bg-slate-50"
                      }`}
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
                            className="p-1 text-indigo-600 transition hover:text-indigo-800"
                            onClick={() => toggleExpand(med.id)}
                            aria-label={
                              isExpanded
                                ? `Collapse details for ${med.name}`
                                : `Expand details for ${med.name}`
                            }
                          >
                            <Icon
                              name="chevron-right-small"
                              className={`h-4 w-4 transition-transform ${
                                isExpanded ? "rotate-90" : ""
                              }`}
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
                          {renderEditableLine(
                            med.id,
                            "frequency",
                            med.frequency,
                            {
                              textClass: "font-medium text-slate-800",
                            }
                          )}
                          {renderEditableLine(
                            med.id,
                            "duration",
                            med.duration,
                            {
                              textClass: "text-sm text-slate-500",
                            }
                          )}
                        </div>
                      </td>
                      <td className="py-3 align-top text-slate-700">
                        {renderEditableLine(
                          med.id,
                          "instructions",
                          med.instructions,
                          {
                            multiline: true,
                            textClass: "text-slate-700 w-full",
                          }
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="text-right">
                          <p className="font-medium text-slate-800">
                            {med.date}
                          </p>
                          <p className="text-sm text-slate-500">{med.doctor}</p>
                        </div>
                      </td>
                      {visibleOptionalColumns.map((column) => (
                        <td
                          key={`${med.id}-${column}`}
                          className="px-4 py-3 align-top"
                        >
                          {optionalColumnConfig[column].renderCell(med)}
                        </td>
                      ))}
                    </tr>
                  );

                  if (!isExpanded) return [baseRow];

                  return [
                    baseRow,
                    <tr
                      key={`${med.id}-details`}
                      className="border-t border-slate-100 bg-[#F7F7FB]"
                    >
                      <td className="pl-6" />
                      <td
                        colSpan={4 + visibleOptionalColumns.length}
                        className="px-6 py-5"
                      >
                        <div className="grid gap-8 text-sm text-slate-700 md:grid-cols-3">
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs uppercase text-slate-400">
                                Full name
                              </p>
                              <p className="mt-1 font-medium text-slate-900">
                                {med.patient?.fullName}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase text-slate-400">
                                Contact
                              </p>
                              <p className="mt-1 font-medium text-slate-900">
                                {med.contact}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <p className="text-xs uppercase text-slate-400">
                                Prescribed by
                              </p>
                              <p className="mt-1 font-medium text-slate-900">
                                {med.doctor}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase text-slate-400">
                                Additional instructions
                              </p>
                              <p className="mt-1 text-slate-700">
                                {med.instructions}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs uppercase text-slate-400">
                              Patient tags
                            </p>
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
                              {med.patient?.tags?.map((tag, index) => (
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
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-4 text-sm text-slate-600 sm:px-6">
          <p className="text-xs text-slate-500 sm:text-sm">
            Showing {startEntry}-{endEntry} of {totalCount}
          </p>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </footer>
      </section>

      <ColumnConfigurator
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        activeColumns={activeOptionalColumns}
        hiddenColumns={hiddenOptionalColumns}
        onToggleColumn={handleToggleColumnVisibility}
        onReset={handleResetColumns}
        saveForTeam={saveForTeam}
        onToggleSave={() => setSaveForTeam((prev) => !prev)}
      />
    </>
  );
}

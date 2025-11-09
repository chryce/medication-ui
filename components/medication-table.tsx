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
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";

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
      <section className="w-full rounded-3xl border border-[#d0d7de] bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-[#d0d7de] px-4 pb-4 pt-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <label
            className={`flex gap-1 py-2 h-8 rounded-sm border [#e3e3e3] border-solid bg-[#fbfbfb] items-center px-4 text-sm text-slate-500 transition ${
              searchInput
                ? "border-indigo-500 bg-white"
                : "border-[#d0d7de] bg-slate-50"
            } focus-within:border-indigo-400 w-full md:w-[320px] md:max-w-lg`}
          >
            <Icon name="search" alt="Search" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
            />
            <div className="flex h-6 w-6 items-center justify-center">
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-[#d0d7de]"
                  aria-label="Clear search text"
                >
                  ✕
                </button>
              )}
            </div>
          </label>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 md:mt-0">
            {/* Row with Sort by + Filter + Configure Columns side-by-side */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button className="flex flex-1 sm:flex-none items-center justify-between gap-2 h-8 border-[#d0d7de] px-3 py-2 text-xs font-medium text-[#818287] sm:text-sm rounded-sm border [#e3e3e3] border-solid bg-[#fbfbfb]">
                <p>Sort by</p>
                <Icon name="chevron-down" />
              </button>

              <button
                className="flex flex-1 sm:flex-none items-center justify-center gap-2 h-8 px-3 py-2 text-xs font-medium text-[#2c3242]
             border border-solid border-[#e3e3e3] rounded-sm bg-[#fbfbfb]
             shadow-[0_2px_0_0_#d6d6d6]"
              >
                <Icon
                  name="filter"
                  className="text-[#818287]"
                  alt="Filter icon"
                  size={18}
                />
                Filter
              </button>

              <button
                type="button"
                onClick={() => setIsConfigOpen(true)}
                className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-sm h-8 border border-[#d0d7de] px-3 py-2 text-xs font-medium text-[#2c3242] shadow-[0_2px_0_0_#d6d6d6]"
              >
                <Icon name="columns" alt="Columns icon" size={18} />
                Configure columns
              </button>
            </div>
          </div>
        </div>

        {/* Selection toolbar */}
        {selectionCount > 0 && (
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 border-b border-indigo-100 bg-indigo-50 px-4 sm:px-6 py-4 text-sm">
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
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDismissEdits}
                  className="rounded-sm border border-slate-300 bg-white px-4 py-2 font-medium text-[#818287] shadow-sm transition hover:bg-slate-50"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="rounded-sm bg-indigo-600 px-5 py-2 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Save changes
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleStartEditing}
                  className="flex items-center gap-2 rounded-sm border border-[#d0d7de] bg-white px-3 py-2 font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  <Icon name="edit" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => alert("Export action coming soon")}
                  className="flex items-center gap-2 rounded-sm border border-[#d0d7de] bg-white px-3 py-2 font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  <Icon name="export" />
                  Export
                </button>
                <button
                  type="button"
                  onClick={() => alert("Archive action coming soon")}
                  className="flex items-center gap-2 rounded-sm border border-red-100 bg-red-50 px-3 py-2 font-medium text-red-600 shadow-sm transition hover:bg-red-100"
                >
                  <Icon name="archive" />
                  Archive
                </button>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className="w-full overflow-x-auto px-2 sm:px-4">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            {/* ---------- HEADER ---------- */}
            <thead className="border-b border-[#d0d7de] bg-[#fbfbfb]">
              <tr className="tracking-wide font-inter text-sm font-medium text-left text-[#6b6f7a]">
                {/* Selection */}
                <th className="w-12 px-6 py-3">
                  <SelectionCheckbox
                    checked={allSelected}
                    indeterminate={indeterminate}
                    onToggle={toggleAllRows}
                    label="Select all medications"
                  />
                </th>

                {/* Empty column for expand icon */}
                <th className="w-8 px-2 py-3"></th>

                {/* Core headers */}
                <th>
                  <div className="flex items-center gap-1">
                    <span>Medication</span>
                    <Icon name="chevron-down" />
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-1">
                    <span>Frequency</span>
                    <Icon name="chevron-down" />
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-1">
                    <span>Additional instructions</span>
                    <Icon name="chevron-down" />
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <Icon name="chevron-down" />
                  </div>
                </th>

                {/* Optional columns */}
                {visibleOptionalColumns.map((column) => (
                  <th key={`header-${column}`} className="text-left">
                    {optionalColumnConfig[column].label}
                  </th>
                ))}

                <th className="w-8 px-3 text-center">
                  {/* <EllipsisVerticalIcon className="h-5 w-5 text-slate-400" /> */}
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Loading state */}
              {isLoading && (
                <SkeletonTable
                  optionalColumns={visibleOptionalColumns.length}
                />
              )}

              {/* Error state */}
              {!isLoading && errorMessage && (
                <tr>
                  <td
                    colSpan={6 + visibleOptionalColumns.length}
                    className="py-10 text-center text-sm text-rose-500"
                  >
                    {errorMessage}
                  </td>
                </tr>
              )}

              {/* Empty state */}
              {!isLoading && !errorMessage && medications.length === 0 && (
                <tr>
                  <td
                    colSpan={6 + visibleOptionalColumns.length}
                    className="py-10 text-center text-sm text-slate-500"
                  >
                    No medication orders found.
                  </td>
                </tr>
              )}

              {/* Data rows */}
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
                      {/* Selection */}
                      <td className="px-6 py-4">
                        <SelectionCheckbox
                          checked={isSelected}
                          onToggle={() => toggleRowSelection(med.id)}
                          label={`Select ${med.name}`}
                        />
                      </td>

                      {/* Expand icon */}
                      <td className="px-2 py-3">
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
                              isExpanded ? "" : "rotate-90"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Medication data */}
                      <td className="py-3">
                        <div className="w-full space-y-1">
                          {renderEditableLine(med.id, "name", med.name, {
                            textClass: "font-medium text-slate-900",
                          })}
                          {renderEditableLine(med.id, "dosage", med.dosage, {
                            textClass: "text-sm text-slate-500",
                          })}
                        </div>
                      </td>

                      {/* Frequency + Duration */}
                      <td className="py-3">
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

                      {/* Instructions */}
                      <td className="py-3 text-[#818287]">
                        {renderEditableLine(
                          med.id,
                          "instructions",
                          med.instructions,
                          {
                            multiline: true,
                            textClass: "text-[#818287] w-full",
                          }
                        )}
                      </td>

                      {/* Date + Doctor */}
                      <td>
                        <div>
                          <p className="font-medium text-slate-800">
                            {med.date}
                          </p>
                          <p className="text-sm text-slate-500">{med.doctor}</p>
                        </div>
                      </td>

                      {/* Optional column cells */}
                      {visibleOptionalColumns.map((column) => (
                        <td key={`${med.id}-${column}`}>
                          {optionalColumnConfig[column].renderCell(med)}
                        </td>
                      ))}

                      <th className="w-8 px-3 text-center">
                        <EllipsisVerticalIcon className="h-5 w-5 text-slate-400" />
                      </th>
                    </tr>
                  );

                  // Expanded details row
                  if (!isExpanded) return [baseRow];

                  return [
                    baseRow,
                    <tr
                      key={`${med.id}-details`}
                      className="border-t border-slate-100 bg-[#F7F7FB]"
                    >
                      <td className="pl-6" />
                      <td />
                      <td
                        colSpan={4 + visibleOptionalColumns.length}
                        className="px-6 py-5"
                      >
                        <div className="grid gap-8 text-sm text-[#818287] sm:grid-cols-2 lg:grid-cols-3">
                          {/* Column 1 */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs  text-slate-400">
                                Full name
                              </p>
                              <p className="mt-1 font-medium text-slate-900">
                                {med.patient?.fullName}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs  text-slate-400">Contact</p>
                              <p className="mt-1 font-medium text-slate-900">
                                {med.contact}
                              </p>
                            </div>
                          </div>

                          {/* Column 2 */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs  text-slate-400">
                                Prescribed by
                              </p>
                              <p className="mt-1 font-medium text-slate-900">
                                {med.doctor}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs  text-slate-400">
                                Additional instructions
                              </p>
                              <p className="mt-1 text-[#818287]">
                                {med.instructions}
                              </p>
                            </div>
                          </div>

                          {/* Column 3 */}
                          <div>
                            <p className="text-xs  text-slate-400">
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
                      <td className="w-8 px-3 text-center"></td>
                    </tr>,
                  ];
                })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 border-t border-[#d0d7de] px-4 py-4 text-sm text-slate-600 sm:px-6">
          <p className="text-xs text-slate-500 sm:text-sm">
            Showing {startEntry}-{endEntry} of {totalCount}
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
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

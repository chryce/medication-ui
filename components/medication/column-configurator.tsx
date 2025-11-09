"use client";

import { Icon } from "@/components/ui/icon";
import type { ColumnId } from "@/types/medication";
import { optionalColumnConfig } from "./optional-columns";

type ColumnConfiguratorProps = {
  isOpen: boolean;
  onClose: () => void;
  activeColumns: ColumnId[];
  hiddenColumns: ColumnId[];
  onToggleColumn: (column: ColumnId) => void;
  onReset: () => void;
  saveForTeam: boolean;
  onToggleSave: () => void;
};

export function ColumnConfigurator({
  isOpen,
  onClose,
  activeColumns,
  hiddenColumns,
  onToggleColumn,
  onReset,
  saveForTeam,
  onToggleSave,
}: ColumnConfiguratorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="column-config-title"
        className="w-full max-w-3xl rounded-sm bg-white shadow-[0_25px_40px_rgba(15,23,42,0.12)]"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 pt-6">
          <h2
            id="column-config-title"
            className="text-2xl font-semibold text-slate-900"
          >
            Configure table columns
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100"
            aria-label="Close column configurator"
          >
            ✕
          </button>
        </div>
        <div className="px-8 py-6">
          <div className="grid gap-8 md:grid-cols-2">
            <section>
              <p className="text-sm font-semibold text-slate-700">
                Available columns
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {hiddenColumns.map((column) => (
                  <button
                    key={`available-${column}`}
                    type="button"
                    onClick={() => onToggleColumn(column)}
                    className="flex items-center justify-between rounded-sm bg-[#E2E8FF] px-4 py-2 text-sm font-medium text-blue-900 shadow-sm transition hover:bg-[#d6ddff]"
                  >
                    <span className="flex items-center gap-3 font-bold">
                      <Icon name="drag-blue" />
                      {optionalColumnConfig[column].label}
                    </span>
                    <span
                      className="text-black transition hover:text-black"
                      aria-hidden
                    >
                      ✕
                    </span>
                  </button>
                ))}
                {hiddenColumns.length === 0 && (
                  <div className="rounded-sm border border-dashed border-slate-200 px-4 py-2 text-center text-xs text-slate-400">
                    No additional columns
                  </div>
                )}
              </div>
            </section>
            <section>
              <p className="text-sm font-semibold text-slate-700">
                Visible columns (Drag to re-order)
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-sm bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-3">
                    <Icon name="drag-gray" />
                    Patient Name (locked)
                  </span>
                </div>
                {activeColumns.map((column) => (
                  <div
                    key={`visible-${column}`}
                    className="flex items-center justify-between rounded-sm bg-[#E2E8FF] px-4 py-2 text-sm font-medium text-blue-900 shadow-sm"
                  >
                    <span className="flex items-center gap-3 font-bold">
                      <Icon name="drag-blue" />
                      {optionalColumnConfig[column].label}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleColumn(column)}
                      className="text-black transition hover:text-black"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {activeColumns.length === 0 && (
                  <div className="rounded-sm border border-dashed border-slate-200 px-4 py-2 text-center text-xs text-slate-400">
                    No optional columns selected
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
        <div className="border-t border-slate-200 px-8 py-6">
          <div className="rounded-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Save as default for all team members
              </span>
              <button
                type="button"
                onClick={onToggleSave}
                role="switch"
                aria-checked={saveForTeam}
                className={`h-6 w-11 rounded-full border transition ${
                  saveForTeam
                    ? "border-green-500 bg-green-500"
                    : "border-slate-300 bg-slate-200"
                }`}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white shadow transition ${
                    saveForTeam ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={onReset}
              className="rounded-sm border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Reset to defaults
            </button>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-sm border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-sm bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

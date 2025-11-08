import type { ReactNode } from "react";

export type Medication = {
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

export type ColumnId = "contact" | "patientTags" | "notes";

export type OptionalColumnConfig = {
  label: string;
  description: string;
  renderCell: (med: Medication) => ReactNode;
};

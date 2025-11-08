import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type { Medication } from "@/types/medication";
import { formatDisplayDate } from "@/lib/dates";

const TOTAL_ITEMS = 200;
const PAGE_SIZE_DEFAULT = 20;

faker.seed(42);

const colorClasses = [
  "border-l-4 border-green-500",
  "border-l-4 border-red-400",
  "border-l-4 border-blue-500",
  "border-l-4 border-pink-400",
  "border-l-4 border-indigo-400",
];

const medications: Medication[] = Array.from({ length: TOTAL_ITEMS }, (_, index) =>
  buildMedication(index + 1),
);

function buildMedication(id: number): Medication {
  return {
    id,
    name: faker.commerce.productName(),
    dosage: `${faker.number.int({ min: 5, max: 500 })}mg · ${faker.helpers.arrayElement([
      "Tablets",
      "Capsules",
      "Vial",
      "Injection",
    ])}`,
    frequency: faker.helpers.arrayElement([
      "Once a day (OD)",
      "Twice a day (BID)",
      "Every 8 hours",
      "Three times a day (TID)",
    ]),
    duration: `${faker.number.int({ min: 1, max: 4 })} ${faker.helpers.arrayElement([
      "day",
      "days",
      "weeks",
    ])} · ${faker.helpers.arrayElement(["Oral", "Injection"])}`,
    instructions: faker.helpers.arrayElement([
      "Take after meals and avoid acidic food",
      "Don't take on empty stomach",
      "Drink plenty of water",
      "Monitor for dizziness",
      "Not recorded",
    ]),
    date: formatDisplayDate(
      faker.date.between({ from: "2021-10-20T00:00:00.000Z", to: "2021-10-24T00:00:00.000Z" }),
    ),
    doctor: `Dr. ${faker.person.firstName()} ${faker.person.lastName()}`,
    contact: faker.phone.number(),
    notes: faker.lorem.sentence(),
    patient: {
      fullName: faker.person.fullName(),
      tags: faker.helpers.arrayElements(
        [
          "Hypertensive",
          "Hypersensitive",
          "Diabetic",
          "Asthmatic",
          "High risk",
          "Pregnant",
        ],
        { min: 1, max: 3 },
      ),
    },
    color: faker.helpers.arrayElement(colorClasses),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageParam = Number(searchParams.get("page") ?? "1");
  const pageSizeParam = Number(searchParams.get("pageSize") ?? PAGE_SIZE_DEFAULT);

  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize =
    Number.isNaN(pageSizeParam) || pageSizeParam < 1 ? PAGE_SIZE_DEFAULT : pageSizeParam;
  const searchQuery = (searchParams.get("search") ?? "").trim().toLowerCase();

  const filtered = searchQuery
    ? medications.filter((med) =>
        [
          med.name,
          med.dosage,
          med.frequency,
          med.duration,
          med.instructions,
          med.doctor,
          med.patient?.fullName ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery),
      )
    : medications;

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = filtered.slice(start, end);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return NextResponse.json({
    data,
    total: filtered.length,
    page,
    pageSize,
    totalPages,
  });
}

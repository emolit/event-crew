import { contactSchema } from "@/lib/contact-schema";
import { services } from "@/data/services";

const valid = {
  name: "Иван",
  phone: "+7 999 123-45-67",
  telegram: "@ivan",
  eventStartDate: "2026-09-25",
  eventEndDate: "2026-09-27",
  staffTypes: ["Хостес", "Официанты"],
  quantity: "10",
  comment: "Регистрация гостей",
  website: "",
};

it("accepts a valid request", () => {
  expect(contactSchema.safeParse(valid).success).toBe(true);
});

it("rejects an empty name", () => {
  expect(contactSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
});

it("rejects a phone with fewer than ten digits", () => {
  expect(contactSchema.safeParse({ ...valid, phone: "123" }).success).toBe(false);
});

it("accepts a phone containing exactly fifteen digits", () => {
  expect(contactSchema.safeParse({ ...valid, phone: "+123 456 789 012 345" }).success).toBe(true);
});

it("rejects a phone containing sixteen digits", () => {
  expect(contactSchema.safeParse({ ...valid, phone: "+123 456 789 012 345 6" }).success).toBe(false);
});

it("rejects phone characters outside digits, spaces, plus, dash, parentheses, and periods", () => {
  expect(contactSchema.safeParse({ ...valid, phone: "+7 (999) 123-45-67 ext" }).success).toBe(false);
});

it("accepts an omitted period, a one-day event, or an ordered date range", () => {
  expect(contactSchema.safeParse({ ...valid, eventStartDate: "", eventEndDate: "" }).success).toBe(true);
  expect(contactSchema.safeParse({ ...valid, eventStartDate: "2028-02-29", eventEndDate: "" }).success).toBe(true);
  expect(contactSchema.safeParse({ ...valid, eventStartDate: "2028-02-29", eventEndDate: "2028-03-02" }).success).toBe(true);
});

it.each(["2026-02-29", "2026-13-01", "2026-9-25", "2026-09-250"])(
  "rejects malformed or impossible start date %s",
  (eventStartDate) => {
    expect(contactSchema.safeParse({ ...valid, eventStartDate }).success).toBe(false);
  },
);

it("rejects an end date without a start date or before the start date", () => {
  expect(contactSchema.safeParse({ ...valid, eventStartDate: "", eventEndDate: "2026-09-27" }).success).toBe(false);
  expect(contactSchema.safeParse({ ...valid, eventStartDate: "2026-09-27", eventEndDate: "2026-09-25" }).success).toBe(false);
  expect(contactSchema.safeParse({ ...valid, eventStartDate: "2026-09-27", eventEndDate: "2026-09-27" }).success).toBe(true);
});

it("accepts zero or several configured personnel types", () => {
  expect(contactSchema.safeParse({ ...valid, staffTypes: [] }).success).toBe(true);

  for (const staffType of ["Другое", ...services.map((service) => service.name)]) {
    expect(contactSchema.safeParse({ ...valid, staffTypes: [staffType] }).success).toBe(true);
  }
});

it("rejects unknown or duplicate personnel types", () => {
  expect(contactSchema.safeParse({ ...valid, staffTypes: ["Неизвестная услуга"] }).success).toBe(false);
  expect(contactSchema.safeParse({ ...valid, staffTypes: ["Хостес", "Хостес"] }).success).toBe(false);
});

it("rejects a filled honeypot", () => {
  expect(contactSchema.safeParse({ ...valid, website: "spam.example" }).success).toBe(false);
});

it("rejects non-positive quantity", () => {
  expect(contactSchema.safeParse({ ...valid, quantity: "0" }).success).toBe(false);
});

it("normalizes fields and turns an empty quantity into undefined", () => {
  const result = contactSchema.parse({
    ...valid,
    name: "  Иван  ",
    quantity: "",
  });

  expect(result).toMatchObject({ name: "Иван", quantity: undefined });
});

it("rejects quantities above 500", () => {
  expect(contactSchema.safeParse({ ...valid, quantity: "501" }).success).toBe(false);
});

import { contactSchema } from "@/lib/contact-schema";
import { services } from "@/data/services";

const valid = {
  name: "Иван",
  phone: "+7 999 123-45-67",
  telegram: "@ivan",
  eventDate: "2026-09-25",
  staffType: "Хостес",
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

it("accepts an empty event date or a real ISO calendar date", () => {
  expect(contactSchema.safeParse({ ...valid, eventDate: "" }).success).toBe(true);
  expect(contactSchema.safeParse({ ...valid, eventDate: "2028-02-29" }).success).toBe(true);
});

it.each(["2026-02-29", "2026-13-01", "2026-9-25", "2026-09-250"])(
  "rejects malformed or impossible event date %s",
  (eventDate) => {
    expect(contactSchema.safeParse({ ...valid, eventDate }).success).toBe(false);
  },
);

it("accepts only configured service names, Другое, or an empty staff type", () => {
  for (const staffType of ["", "Другое", ...services.map((service) => service.name)]) {
    expect(contactSchema.safeParse({ ...valid, staffType }).success).toBe(true);
  }

  expect(contactSchema.safeParse({ ...valid, staffType: "Неизвестная услуга" }).success).toBe(false);
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

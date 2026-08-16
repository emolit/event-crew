import { contactSchema } from "@/lib/contact-schema";

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

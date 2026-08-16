import { z } from "zod";
import { services } from "@/data/services";

const optionalText = (maxLength: number) => z.string().trim().max(maxLength);
const allowedStaffTypes = new Set(["", "Другое", ...services.map((service) => service.name)]);

function isIsoCalendarDate(value: string): boolean {
  if (value === "") {
    return true;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12) {
    return false;
  }

  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= daysInMonth[month - 1];
}

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(80),
  phone: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[0-9 +().-]+$/)
    .refine((value) => {
      const digitCount = value.replace(/\D/g, "").length;

      return digitCount >= 10 && digitCount <= 15;
    }),
  telegram: optionalText(80),
  eventDate: z.string().trim().max(10).refine(isIsoCalendarDate),
  staffType: optionalText(80).refine((value) => allowedStaffTypes.has(value)),
  quantity: z.string().trim().transform((value, context) => {
    if (value === "") {
      return undefined;
    }

    if (!/^\d+$/.test(value)) {
      context.addIssue({ code: "custom", message: "Quantity must be an integer." });
      return z.NEVER;
    }

    const quantity = Number(value);

    if (quantity < 1 || quantity > 500) {
      context.addIssue({ code: "custom", message: "Quantity must be between 1 and 500." });
      return z.NEVER;
    }

    return quantity;
  }),
  comment: optionalText(1500),
  website: z.string().trim().length(0),
});

export type ContactPayload = z.output<typeof contactSchema>;

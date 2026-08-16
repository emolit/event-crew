import { z } from "zod";

const optionalText = (maxLength: number) => z.string().trim().max(maxLength);

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(80),
  phone: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .refine((value) => {
      const digitCount = value.replace(/\D/g, "").length;

      return digitCount >= 10 && digitCount <= 15;
    }),
  telegram: optionalText(80),
  eventDate: z.string().trim(),
  staffType: optionalText(80),
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

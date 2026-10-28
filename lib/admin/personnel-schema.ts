import { z } from "zod";
export const personnelInputSchema=z.object({name:z.string().trim().min(2).max(100),description:z.string().trim().min(10).max(2000),price:z.number().int().positive().max(100000),mediaId:z.string().min(1).max(80),alt:z.string().trim().min(2).max(240)});
export type PersonnelInput=z.infer<typeof personnelInputSchema>;

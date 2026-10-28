import { z } from "zod";

export const projectInputSchema = z.object({
  title: z.string().trim().min(2).max(120),
  type: z.string().trim().min(2).max(120),
  roles: z.array(z.string().trim().min(1).max(80)).max(20),
  detailTitle: z.string().trim().min(2).max(180),
  description: z.string().trim().min(10).max(5_000),
  size: z.enum(["standard", "wide", "tall"]),
  images: z.array(z.object({ mediaId: z.string().min(1).max(80), alt: z.string().trim().min(2).max(240) })).min(1).max(20),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

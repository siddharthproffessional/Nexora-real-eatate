import { z } from "zod";
import { LEAD_STATUSES, NOTE_CHANNELS } from "@/lib/domain/types";

export const leadUpdateSchema = z
  .object({
    status: z.enum(LEAD_STATUSES).optional(),
    agentId: z.preprocess((v) => (v === "" || v === "unassigned" ? null : v), z.string().max(64).nullable().optional()),
    /** ISO date-time, or null to clear. */
    followUpAt: z.preprocess(
      (v) => (v === "" ? null : v),
      z
        .string()
        .refine((s) => !Number.isNaN(Date.parse(s)), "Enter a valid date and time")
        .nullable()
        .optional(),
    ),
  })
  .refine((d) => Object.keys(d).length > 0, "Nothing to update");

export const leadNoteSchema = z.object({
  channel: z.enum(NOTE_CHANNELS).default("note"),
  body: z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string().min(2, "Write a note").max(4000)),
});

export const loginSchema = z.object({
  email: z.preprocess((v) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email("Enter your work email")),
  password: z.string().min(1, "Enter your password").max(200),
  next: z.string().optional(),
});

import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const doctorsTable = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  qualification: text("qualification").notNull(),
  specialization: text("specialization").notNull(),
  experience: integer("experience").notNull().default(0),
  consultationFee: real("consultation_fee").notNull().default(0),
  availableFrom: text("available_from"),
  availableTo: text("available_to"),
  availableDays: text("available_days"),
  photoUrl: text("photo_url"),
  shopId: integer("shop_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDoctorSchema = createInsertSchema(doctorsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctorsTable.$inferSelect;

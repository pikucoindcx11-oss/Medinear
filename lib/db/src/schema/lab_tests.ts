import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const labTestsTable = pgTable("lab_tests", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  testName: text("test_name").notNull(),
  category: text("category").notNull(),
  shopId: integer("shop_id").notNull(),
  scheduledDate: text("scheduled_date"),
  status: text("status").notNull().default("pending"),
  reportUrl: text("report_url"),
  price: real("price").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLabTestSchema = createInsertSchema(labTestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLabTest = z.infer<typeof insertLabTestSchema>;
export type LabTest = typeof labTestsTable.$inferSelect;

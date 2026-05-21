import { Router } from "express";
import { db } from "@workspace/db";
import { appointmentsTable, doctorsTable, shopsTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import {
  ListAppointmentsQueryParams,
  CreateAppointmentBody as AppointmentInput,
  UpdateAppointmentBody as AppointmentUpdate,
  GetAppointmentParams,
  UpdateAppointmentParams,
  DeleteAppointmentParams,
} from "@workspace/api-zod";

const router = Router();

async function enrichAppointment(apt: typeof appointmentsTable.$inferSelect) {
  const [doctor] = await db
    .select({ name: doctorsTable.name, specialization: doctorsTable.specialization })
    .from(doctorsTable)
    .where(eq(doctorsTable.id, apt.doctorId));
  const [shop] = await db
    .select({ name: shopsTable.name })
    .from(shopsTable)
    .where(eq(shopsTable.id, apt.shopId));
  return {
    ...apt,
    doctorName: doctor?.name ?? null,
    specialization: doctor?.specialization ?? null,
    shopName: shop?.name ?? null,
  };
}

async function generateToken(doctorId: number, date: string): Promise<number> {
  const existing = await db
    .select()
    .from(appointmentsTable)
    .where(and(eq(appointmentsTable.doctorId, doctorId), eq(appointmentsTable.appointmentDate, date)));
  return existing.length + 1;
}

router.get("/appointments", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const query = ListAppointmentsQueryParams.parse(req.query);
    let apts = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.userId, user.id));
    if (query.status) {
      apts = apts.filter((a) => a.status === query.status);
    }
    const enriched = await Promise.all(apts.map(enrichAppointment));
    res.json(enriched);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to list appointments" });
  }
});

router.post("/appointments", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const data = AppointmentInput.parse(req.body);
    const tokenNumber = await generateToken(data.doctorId, data.appointmentDate);
    const [apt] = await db
      .insert(appointmentsTable)
      .values({ ...data, userId: user.id, tokenNumber, status: "pending" })
      .returning();
    res.status(201).json(await enrichAppointment(apt));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Invalid appointment data" });
  }
});

router.get("/appointments/:id", async (req, res) => {
  try {
    const { id } = GetAppointmentParams.parse({ id: Number(req.params.id) });
    const [apt] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, id));
    if (!apt) return res.status(404).json({ error: "Appointment not found" });
    res.json(await enrichAppointment(apt));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to get appointment" });
  }
});

router.patch("/appointments/:id", async (req, res) => {
  try {
    const { id } = UpdateAppointmentParams.parse({ id: Number(req.params.id) });
    const data = AppointmentUpdate.parse(req.body);
    const [apt] = await db
      .update(appointmentsTable)
      .set(data)
      .where(eq(appointmentsTable.id, id))
      .returning();
    if (!apt) return res.status(404).json({ error: "Appointment not found" });
    res.json(await enrichAppointment(apt));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Invalid appointment data" });
  }
});

router.delete("/appointments/:id", async (req, res) => {
  try {
    const { id } = DeleteAppointmentParams.parse({ id: Number(req.params.id) });
    await db.delete(appointmentsTable).where(eq(appointmentsTable.id, id));
    res.status(204).send();
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

export default router;

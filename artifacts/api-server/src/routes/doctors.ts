import { Router } from "express";
import { db } from "@workspace/db";
import { doctorsTable, shopsTable, reviewsTable } from "@workspace/db";
import { eq, avg, count, sql } from "drizzle-orm";
import {
  ListDoctorsQueryParams,
  CreateDoctorBody as DoctorInput,
  UpdateDoctorBody as DoctorUpdate,
  GetDoctorParams,
  UpdateDoctorParams,
  DeleteDoctorParams,
  ListShopDoctorsParams,
} from "@workspace/api-zod";

const router = Router();

async function enrichDoctor(doctor: typeof doctorsTable.$inferSelect) {
  const [shop] = await db.select({ name: shopsTable.name }).from(shopsTable).where(eq(shopsTable.id, doctor.shopId));
  const reviewStats = await db
    .select({ avg: avg(reviewsTable.rating), count: count() })
    .from(reviewsTable)
    .where(eq(reviewsTable.doctorId, doctor.id));
  return {
    ...doctor,
    shopName: shop?.name ?? null,
    rating: reviewStats[0]?.avg ? Number(parseFloat(String(reviewStats[0].avg)).toFixed(1)) : null,
    reviewCount: Number(reviewStats[0]?.count ?? 0),
  };
}

router.get("/shops/:id/doctors", async (req, res) => {
  try {
    const { id } = ListShopDoctorsParams.parse({ id: Number(req.params.id) });
    const doctors = await db.select().from(doctorsTable).where(eq(doctorsTable.shopId, id));
    const enriched = await Promise.all(doctors.map(enrichDoctor));
    res.json(enriched);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to list shop doctors" });
  }
});

router.get("/doctors", async (req, res) => {
  try {
    const query = ListDoctorsQueryParams.parse(req.query);
    let doctors = await db.select().from(doctorsTable);
    if (query.search) {
      const s = query.search.toLowerCase();
      doctors = doctors.filter(
        (d) => d.name.toLowerCase().includes(s) || d.specialization.toLowerCase().includes(s)
      );
    }
    if (query.specialization) {
      doctors = doctors.filter((d) => d.specialization.toLowerCase() === query.specialization!.toLowerCase());
    }
    if (query.shopId !== undefined) {
      doctors = doctors.filter((d) => d.shopId === query.shopId);
    }
    const enriched = await Promise.all(doctors.map(enrichDoctor));
    res.json(enriched);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to list doctors" });
  }
});

router.post("/doctors", async (req, res) => {
  try {
    const data = DoctorInput.parse(req.body);
    const [doctor] = await db.insert(doctorsTable).values(data).returning();
    res.status(201).json(await enrichDoctor(doctor));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Invalid doctor data" });
  }
});

router.get("/doctors/:id", async (req, res) => {
  try {
    const { id } = GetDoctorParams.parse({ id: Number(req.params.id) });
    const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, id));
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(await enrichDoctor(doctor));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to get doctor" });
  }
});

router.patch("/doctors/:id", async (req, res) => {
  try {
    const { id } = UpdateDoctorParams.parse({ id: Number(req.params.id) });
    const data = DoctorUpdate.parse(req.body);
    const [doctor] = await db.update(doctorsTable).set(data).where(eq(doctorsTable.id, id)).returning();
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(await enrichDoctor(doctor));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Invalid doctor data" });
  }
});

router.delete("/doctors/:id", async (req, res) => {
  try {
    const { id } = DeleteDoctorParams.parse({ id: Number(req.params.id) });
    await db.delete(doctorsTable).where(eq(doctorsTable.id, id));
    res.status(204).send();
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to delete doctor" });
  }
});

export default router;

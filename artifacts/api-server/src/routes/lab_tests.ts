import { Router } from "express";
import { db } from "@workspace/db";
import { labTestsTable, shopsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateLabTestBody as LabTestInput,
  UpdateLabTestBody as LabTestUpdate,
  GetLabTestParams,
  UpdateLabTestParams,
  DeleteLabTestParams,
} from "@workspace/api-zod";

const router = Router();

async function enrichLabTest(lt: typeof labTestsTable.$inferSelect) {
  const [shop] = await db.select({ name: shopsTable.name }).from(shopsTable).where(eq(shopsTable.id, lt.shopId));
  return { ...lt, shopName: shop?.name ?? null };
}

router.get("/lab-tests", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    // Admins see all lab tests; regular users see only their own
    const tests = (user as any).isAdmin
      ? await db.select().from(labTestsTable)
      : await db.select().from(labTestsTable).where(eq(labTestsTable.userId, user.id));
    const enriched = await Promise.all(tests.map(enrichLabTest));
    res.json(enriched);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to list lab tests" });
  }
});

router.post("/lab-tests", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const data = LabTestInput.parse(req.body);
    const [lt] = await db
      .insert(labTestsTable)
      .values({ ...data, userId: user.id, status: "pending" })
      .returning();
    res.status(201).json(await enrichLabTest(lt));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Invalid lab test data" });
  }
});

router.get("/lab-tests/:id", async (req, res) => {
  try {
    const { id } = GetLabTestParams.parse({ id: Number(req.params.id) });
    const [lt] = await db.select().from(labTestsTable).where(eq(labTestsTable.id, id));
    if (!lt) return res.status(404).json({ error: "Lab test not found" });
    res.json(await enrichLabTest(lt));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to get lab test" });
  }
});

router.patch("/lab-tests/:id", async (req, res) => {
  try {
    const { id } = UpdateLabTestParams.parse({ id: Number(req.params.id) });
    const data = LabTestUpdate.parse(req.body);
    const [lt] = await db.update(labTestsTable).set(data).where(eq(labTestsTable.id, id)).returning();
    if (!lt) return res.status(404).json({ error: "Lab test not found" });
    res.json(await enrichLabTest(lt));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Invalid lab test data" });
  }
});

router.delete("/lab-tests/:id", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { id } = DeleteLabTestParams.parse({ id: Number(req.params.id) });
    const [lt] = await db.select().from(labTestsTable).where(eq(labTestsTable.id, id));
    if (!lt) return res.status(404).json({ error: "Lab test not found" });
    if (lt.userId !== user.id && !(user as any).isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    await db.delete(labTestsTable).where(eq(labTestsTable.id, id));
    res.status(204).send();
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to delete lab test" });
  }
});

export default router;

import { Router } from "express";
import { db } from "@workspace/db";
import { shopsTable, doctorsTable, appointmentsTable, labTestsTable, usersTable, reviewsTable } from "@workspace/db";
import { eq, avg, count, sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const [shopsData] = await db.select({ total: count() }).from(shopsTable);
    const [openShops] = await db.select({ total: count() }).from(shopsTable).where(eq(shopsTable.isOpen, true));
    const [doctorsData] = await db.select({ total: count() }).from(doctorsTable);
    const [aptsData] = await db.select({ total: count() }).from(appointmentsTable);
    const [pendingApts] = await db.select({ total: count() }).from(appointmentsTable).where(eq(appointmentsTable.status, "pending"));
    const [completedApts] = await db.select({ total: count() }).from(appointmentsTable).where(eq(appointmentsTable.status, "completed"));
    const [labData] = await db.select({ total: count() }).from(labTestsTable);
    const [usersData] = await db.select({ total: count() }).from(usersTable);
    res.json({
      totalShops: Number(shopsData?.total ?? 0),
      openShops: Number(openShops?.total ?? 0),
      totalDoctors: Number(doctorsData?.total ?? 0),
      totalAppointments: Number(aptsData?.total ?? 0),
      pendingAppointments: Number(pendingApts?.total ?? 0),
      completedAppointments: Number(completedApts?.total ?? 0),
      totalLabTests: Number(labData?.total ?? 0),
      totalUsers: Number(usersData?.total ?? 0),
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.get("/dashboard/popular-doctors", async (req, res) => {
  try {
    const doctors = await db.select().from(doctorsTable).limit(6);
    const enriched = await Promise.all(
      doctors.map(async (d) => {
        const [shop] = await db.select({ name: shopsTable.name }).from(shopsTable).where(eq(shopsTable.id, d.shopId));
        const reviewStats = await db
          .select({ avg: avg(reviewsTable.rating), count: count() })
          .from(reviewsTable)
          .where(eq(reviewsTable.doctorId, d.id));
        return {
          ...d,
          shopName: shop?.name ?? null,
          rating: reviewStats[0]?.avg ? Number(parseFloat(String(reviewStats[0].avg)).toFixed(1)) : null,
          reviewCount: Number(reviewStats[0]?.count ?? 0),
        };
      })
    );
    res.json(enriched);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to get popular doctors" });
  }
});

router.get("/dashboard/nearby-shops", async (req, res) => {
  try {
    const shops = await db.select().from(shopsTable).limit(6);
    const enriched = await Promise.all(
      shops.map(async (s) => {
        const reviewStats = await db
          .select({ avg: avg(reviewsTable.rating), count: count() })
          .from(reviewsTable)
          .where(eq(reviewsTable.shopId, s.id));
        return {
          ...s,
          rating: reviewStats[0]?.avg ? Number(parseFloat(String(reviewStats[0].avg)).toFixed(1)) : null,
          reviewCount: Number(reviewStats[0]?.count ?? 0),
        };
      })
    );
    res.json(enriched);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to get nearby shops" });
  }
});

router.get("/dashboard/specializations", async (req, res) => {
  try {
    const doctors = await db.select({ specialization: doctorsTable.specialization }).from(doctorsTable);
    const counts: Record<string, number> = {};
    for (const d of doctors) {
      counts[d.specialization] = (counts[d.specialization] ?? 0) + 1;
    }
    const result = Object.entries(counts).map(([name, doctorCount]) => ({ name, doctorCount, iconName: null }));
    res.json(result);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to get specializations" });
  }
});

export default router;

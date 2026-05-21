import { Router } from "express";
import { db } from "@workspace/db";
import { shopsTable, reviewsTable } from "@workspace/db";
import { eq, like, avg, count, and } from "drizzle-orm";
import {
  ListShopsQueryParams,
  CreateShopBody as ShopInput,
  UpdateShopBody as ShopUpdate,
  GetShopParams,
  UpdateShopParams,
  DeleteShopParams,
  ListShopDoctorsParams,
} from "@workspace/api-zod";

const router = Router();

async function enrichShop(shop: typeof shopsTable.$inferSelect) {
  const reviewStats = await db
    .select({ avg: avg(reviewsTable.rating), count: count() })
    .from(reviewsTable)
    .where(eq(reviewsTable.shopId, shop.id));
  return {
    ...shop,
    rating: reviewStats[0]?.avg ? Number(parseFloat(String(reviewStats[0].avg)).toFixed(1)) : null,
    reviewCount: Number(reviewStats[0]?.count ?? 0),
  };
}

router.get("/shops", async (req, res) => {
  try {
    const query = ListShopsQueryParams.parse(req.query);
    let shops = await db.select().from(shopsTable);
    if (query.isOpen !== undefined) {
      shops = shops.filter((s) => s.isOpen === query.isOpen);
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      shops = shops.filter(
        (shop) => shop.name.toLowerCase().includes(s) || shop.address.toLowerCase().includes(s)
      );
    }
    const enriched = await Promise.all(shops.map(enrichShop));
    res.json(enriched);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to list shops" });
  }
});

router.post("/shops", async (req, res) => {
  try {
    const data = ShopInput.parse(req.body);
    const [shop] = await db.insert(shopsTable).values(data).returning();
    res.status(201).json(await enrichShop(shop));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Invalid shop data" });
  }
});

router.get("/shops/:id", async (req, res) => {
  try {
    const { id } = GetShopParams.parse({ id: Number(req.params.id) });
    const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, id));
    if (!shop) return res.status(404).json({ error: "Shop not found" });
    res.json(await enrichShop(shop));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to get shop" });
  }
});

router.patch("/shops/:id", async (req, res) => {
  try {
    const { id } = UpdateShopParams.parse({ id: Number(req.params.id) });
    const data = ShopUpdate.parse(req.body);
    const [shop] = await db.update(shopsTable).set(data).where(eq(shopsTable.id, id)).returning();
    if (!shop) return res.status(404).json({ error: "Shop not found" });
    res.json(await enrichShop(shop));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Invalid shop data" });
  }
});

router.delete("/shops/:id", async (req, res) => {
  try {
    const { id } = DeleteShopParams.parse({ id: Number(req.params.id) });
    await db.delete(shopsTable).where(eq(shopsTable.id, id));
    res.status(204).send();
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to delete shop" });
  }
});

export default router;

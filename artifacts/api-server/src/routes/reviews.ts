import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListReviewsQueryParams,
  CreateReviewBody as ReviewInput,
  DeleteReviewParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/reviews", async (req, res) => {
  try {
    const query = ListReviewsQueryParams.parse(req.query);
    let reviews = await db.select().from(reviewsTable);
    if (query.doctorId !== undefined) {
      reviews = reviews.filter((r) => r.doctorId === query.doctorId);
    }
    if (query.shopId !== undefined) {
      reviews = reviews.filter((r) => r.shopId === query.shopId);
    }
    const enriched = await Promise.all(
      reviews.map(async (r) => {
        const [user] = await db
          .select({ firstName: usersTable.firstName, lastName: usersTable.lastName })
          .from(usersTable)
          .where(eq(usersTable.id, r.userId));
        const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Anonymous";
        return { ...r, userName: name };
      })
    );
    res.json(enriched);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to list reviews" });
  }
});

router.post("/reviews", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const data = ReviewInput.parse(req.body);
    const [review] = await db
      .insert(reviewsTable)
      .values({ ...data, userId: user.id })
      .returning();
    res.status(201).json({ ...review, userName: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Anonymous" });
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Invalid review data" });
  }
});

router.delete("/reviews/:id", async (req, res) => {
  try {
    const { id } = DeleteReviewParams.parse({ id: Number(req.params.id) });
    await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
    res.status(204).send();
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import shopsRouter from "./shops";
import doctorsRouter from "./doctors";
import appointmentsRouter from "./appointments";
import labTestsRouter from "./lab_tests";
import reviewsRouter from "./reviews";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(shopsRouter);
router.use(doctorsRouter);
router.use(appointmentsRouter);
router.use(labTestsRouter);
router.use(reviewsRouter);
router.use(dashboardRouter);

export default router;

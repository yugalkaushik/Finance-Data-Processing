import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.get("/summary", authenticate, authorize(["VIEWER", "ANALYST", "ADMIN"]), (req, res) =>
  dashboardController.getSummary(req, res)
);
router.get("/categories", authenticate, authorize(["VIEWER", "ANALYST", "ADMIN"]), (req, res) =>
  dashboardController.getCategorySummary(req, res)
);
router.get("/trends", authenticate, authorize(["VIEWER", "ANALYST", "ADMIN"]), (req, res) =>
  dashboardController.getMonthlyTrends(req, res)
);
router.get("/activity", authenticate, authorize(["VIEWER", "ANALYST", "ADMIN"]), (req, res) =>
  dashboardController.getRecentActivity(req, res)
);

export default router;

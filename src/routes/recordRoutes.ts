import { Router } from "express";
import { recordController } from "../controllers/recordController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  (req, res) => recordController.createRecord(req, res)
);
router.get("/", authenticate, authorize(["ANALYST", "ADMIN"]), (req, res) =>
  recordController.getRecords(req, res)
);
router.get("/:id", authenticate, authorize(["ANALYST", "ADMIN"]), (req, res) =>
  recordController.getRecord(req, res)
);
router.put(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  (req, res) => recordController.updateRecord(req, res)
);
router.delete(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  (req, res) => recordController.deleteRecord(req, res)
);

export default router;

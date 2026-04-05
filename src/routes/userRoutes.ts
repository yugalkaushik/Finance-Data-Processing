import { Router } from "express";
import { userController } from "../controllers/userController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.post("/register", (req, res) => userController.register(req, res));
router.post("/login", (req, res) => userController.login(req, res));
router.get("/profile", authenticate, (req, res) =>
  userController.getProfile(req, res)
);

router.get("/", authenticate, authorize(["ADMIN"]), (req, res) =>
  userController.getAllUsers(req, res)
);
router.get("/:id", authenticate, authorize(["ADMIN"]), (req, res) =>
  userController.getUser(req, res)
);
router.put("/:id", authenticate, authorize(["ADMIN"]), (req, res) =>
  userController.updateUser(req, res)
);
router.delete("/:id", authenticate, authorize(["ADMIN"]), (req, res) =>
  userController.deleteUser(req, res)
);

export default router;

import { Router } from "express";
import userController from "../controllers/userController.js";
import { validate } from "../middlewares/validate.js";
import { updateProfileSchema } from "../validators/userValidator.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/profile",
  authMiddleware,
  (req, res) => userController.getProfile(req, res)
);

router.put(
  "/profile",
  authMiddleware,
  validate(updateProfileSchema),
  (req, res) => userController.updateProfile(req, res)
);

export default router;

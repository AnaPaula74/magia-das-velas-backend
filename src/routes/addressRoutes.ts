import { Router } from "express";
import controller from "../controllers/addressController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  addressSchema,
  updateAddressSchema,
} from "../validators/addressValidator.js";
import { idParamSchema } from "../validators/commonValidator.js";

const router = Router();

router.get("/", authMiddleware, (req, res) =>
  controller.list(req, res)
);

router.post("/", authMiddleware, validate(addressSchema), (req, res) =>
  controller.create(req, res)
);

router.put(
  "/:id",
  authMiddleware,
  validate(idParamSchema, "params"),
  validate(updateAddressSchema),
  (req, res) => controller.update(req, res)
);

router.delete(
  "/:id",
  authMiddleware,
  validate(idParamSchema, "params"),
  (req, res) => controller.delete(req, res)
);

export default router;

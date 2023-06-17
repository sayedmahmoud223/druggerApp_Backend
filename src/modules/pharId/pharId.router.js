import Router from "express";
import { addPharId } from "./controller/pharId.controller.js";
import { endPoint } from "./controller/pharId.endPoint.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import {
  addPharIdSchema,
  headersSchema,
} from "./controller/pharId.validation.js";
const router = Router();

router.post(
  "/addPharId",
  // isValid(headersSchema, true),
  // auth(endPoint.create),
  // isValid(addPharIdSchema),
  addPharId
);

export default router;

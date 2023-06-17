import Joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export const headersSchema= generalFeilds.headers

export const cart = Joi.object({
  medicineId: generalFeilds.id,
  quantity: Joi.number().positive().integer().min(1),
}).required();

export const updateQuantity = Joi.object({
  medicineId: generalFeilds.id,
  quantity: Joi.number().positive().integer().min(1),
}).required();
export const selectItems = Joi.object({
  medicineId: generalFeilds.id
}).required();

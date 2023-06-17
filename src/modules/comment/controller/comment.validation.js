import Joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export const headersSchema= generalFeilds.headers

export const createCommentSchema = Joi.object({
  medicineId: generalFeilds.id,
  commentDesc: Joi.string().min(3).max(1500),
}).required();

export const updateCommentSchema = Joi.object({
  medicineId: generalFeilds.id,
  commentId: generalFeilds.id,
}).required();

export const addlikeSchema = Joi.object({
  medicineId: generalFeilds.id,
  commentId: generalFeilds.id,
}).required();

export const createReplyCommentSchema = Joi.object({
  medicineId: generalFeilds.id,
  commentId: generalFeilds.id,
  commentDesc: Joi.string().min(3).max(1500),
}).required();

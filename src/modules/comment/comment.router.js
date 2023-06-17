import { auth } from "../../middlewares/auth.middleware.js";
import * as commentController from "./controller/comment.controller.js";
import { Router } from "express";
import { endPoint } from "./controller/comment.endPoint.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import {
  addlikeSchema,
  createCommentSchema,
  createReplyCommentSchema,
  headersSchema,
  updateCommentSchema,
} from "./controller/comment.validation.js";
let router = Router({ mergeParams: true });

//create comment
router.post(
  "/",
  isValid(headersSchema,true),
  auth(endPoint.create),
  isValid(createCommentSchema),
  asyncHandler(commentController.createComment)
);

//update comment
router.put(
  "/:commentId",
  isValid(headersSchema,true),
  auth(endPoint.update),
  isValid(updateCommentSchema),
  asyncHandler(commentController.updateComment)
);

//add like
router.patch(
  "/:commentId/like",
  isValid(headersSchema,true),
  auth(endPoint.update),
  isValid(addlikeSchema),
  asyncHandler(commentController.addlike)
);

//un like
router.patch(
  "/:commentId/unlike",
  isValid(headersSchema,true),
  auth(endPoint.update),
  isValid(addlikeSchema),
  asyncHandler(commentController.unlike)
);

//create reply
router.post(
  "/:commentId/reply",
  isValid(headersSchema,true),
  auth(endPoint.create),
  isValid(createReplyCommentSchema),
  asyncHandler(commentController.createReplyComment)
);

export default router;

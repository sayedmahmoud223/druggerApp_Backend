import Router from "express";
import * as pharController from "./controller/pharmacy.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import { changePasswordSchema, headersSchema, shareProfileSchema, updateUserSchema } from "./controller/pharmacy.validation.js";
import { endPoint } from "./controller/pharmacy.endPoint.js";
import { userFileUpload } from "../../utils/user.multerCloudinary.js";

const router = Router();

//user profile
router.get(
  "/userProfile",
  isValid(headersSchema, true),
  auth(endPoint.get),
  pharController.profile
);


//update user
router.post(
  "/updateUser",
  isValid(headersSchema, true),
  auth(endPoint.update),
  isValid(updateUserSchema),
  pharController.updateUser
);

//update password
router.patch(
  "/changePassword",
  isValid(headersSchema, true),
  auth(endPoint.update),
  isValid(changePasswordSchema),
  pharController.changePassword
);


//delete user
router.delete(
  "/deleteUser",
  isValid(headersSchema, true),
  auth(endPoint.delete),
  pharController.deleteUser
);


//recover account
router.get("/accountRecovery/:reactiveToken", pharController.accountRecovery);

//profile pic
router.patch(
  "/uploadProfilePic",
  isValid(headersSchema, true),
  auth(endPoint.update),
  userFileUpload().single("profile"),
  pharController.uploadProfilePic
);

//cover pic
router.patch(
  "/uploadCoverPic",
  isValid(headersSchema, true),
  auth(endPoint.update),
  userFileUpload().single("cover"),
  pharController.uploadCoverPic
);

//share Profile

router.get('/:id/shareProfile',isValid(shareProfileSchema),pharController.shareProfile)

export default router;

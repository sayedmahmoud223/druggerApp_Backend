import Router from "express";
import * as authController from "./controller/auth.controller.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import {
  authRegisterSchema,
  forgetPasswordSchema,
  logInSchema,
  resetPasswordOTPSchema,
  resetPasswordSchema,
} from "./controller/auth.validation.js";
const router = Router();

//registeration
router.post("/register", isValid(authRegisterSchema), authController.signUp);

//login
router.post("/login", isValid(logInSchema), authController.logIn);

//confirm Email
router.get("/confirmEmail/:emailToken", authController.confirmEmail);

//new confirm email
router.get("/newConfirmEmail/:emailToken", authController.newConfirmEmail);

//forget password
router.post(
  "/forgetPassword",
  isValid(forgetPasswordSchema),
  authController.forgetPassword
);

//reset password
router.post(
  "/resetPassword/:fp_token",
  isValid(resetPasswordSchema),
  authController.resetPassword
);

//forget password By OTP
router.post(
  "/forgetPasswordOTP",
  isValid(forgetPasswordSchema),
  authController.forgetPasswordOTP
);

//reset password by otp
router.post(
  "/resetPasswordOTP",
  isValid(resetPasswordOTPSchema),
  authController.resetPasswordOTP
);

export default router;

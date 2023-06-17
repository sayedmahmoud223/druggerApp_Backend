import pharModel from "../../../../DB/models/Phar.model.js";
import { Hash, compare } from "../../../utils/Hash&Compare.js";
import pharIdModel from "../../../../DB/models/PharId.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import sendEmail from "../../../utils/Emails/sendEmail.js";
import {
  generateToken,
  verifyToken,
} from "../../../utils/generateAndVerifyToken.js";
import { activationMailWithToken } from "../../../utils/Emails/activationMailWithToken.js";
import { passwordEmail } from "../../../utils/Emails/forgetPasswordEmail.js";
import { otp } from "../../../utils/otpGenerator.js";
import { otpEmail } from "../../../utils/Emails/optEmail.js";
import moment from "moment/moment.js";

// registeration
export const signUp = asyncHandler(async (req, res, next) => {
  const {
    pharId,
    firstName,
    lastName,
    pharName,
    email,
    password,
    cPassword
  } = req.body;
  const checkPharId = await pharIdModel.findOne({ pharId:pharId });
  if (!checkPharId) {
    return next(
      new Error("Your ID is in-valid or not in our database", { cause: 400 })
    );
  }
  if (checkPharId?.isLinked) {
    return next(
      new Error(
        "You can't link your account with this id because it's already registered",
        { cause: 400 }
      )
    );
  }

  const existedUser = await pharModel.findOne({ email });
  if (existedUser) {
    return next(new Error("Email already exist", { cause: 401 }));
  }
  const emailToken = generateToken({
    payload: { email, pharId, pharName },
    signature: process.env.EMAIL_TOKEN,
    expiresIn: 60 * 5,
  });
  const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${emailToken}`;

  const refreshEmailToken = generateToken({
    payload: { email, pharId, pharName },
    signature: process.env.EMAIL_TOKEN,
    expiresIn: 60 * 60 * 24 * 30 * 12,
  });

  const refreshLink = `${req.protocol}://${req.headers.host}/auth/newConfirmEmail/${refreshEmailToken}`;

  const html = activationMailWithToken(link, refreshLink);
  const info = await sendEmail({
    to: email,
    subject: "Confirmation mail",
    html,
  });
  if (!info) {
    return next(new Error("Rejected Email", { cause: 400 }));
  }
  const hashPassword = Hash({ plainText: password });
  const createUser = await pharModel.create({
    pharId,
    firstName,
    lastName,
    pharName,
    email,
    password: hashPassword,
  });
  return res.status(200).json({
    message: "User added successfully",
    user: createUser._id,
  });
})
//====================================================================================================================//

// log in
export const logIn = asyncHandler(async (req, res, next) => {
  const { pharId,  email, password } = req.body;
  if (!(pharId &&  email && password))
    return next(new Errot("Data is required", { cause: 400 }));
  const user = await pharModel.findOne({ pharId, email });
  if (user?.isDeleted || user?.isBlocked) {
    return next(
      new Error(
        "Your account suspended or removed ,contact support for more information",
        { cause: 403 }
      )
    );
  }
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  if (!user.isConfirmed) {
    return next(new Error("Please, confirm your account", { cause: 400 }));
  }
  const checkPharId = await pharIdModel.findOne({ pharId });
  if (!checkPharId?.isLinked) {
    return next(new Error("Your phar id doesn't linked yet", { cause: 400 }));
  }

  const match = compare({ plainText: password, hashValue: user.password });

  if (!match) {
    return next(new Error("password in correct", { cause: 401 }));
  }
  const token = generateToken({
    payload: { id: user._id, email: user.email },
  });
  user.status = "Active";
  await user.save();
  return res
    .status(200)
    .json({ message: "Logged in successfully", authorization: { token } });
})
//====================================================================================================================//

//confirm Email
export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { emailToken } = req.params;

  const { email, pharId, pharName } = verifyToken({
    payload: emailToken,
    signature: process.env.EMAIL_TOKEN,
  });
  const user = await pharModel.findOneAndUpdate(
    { email },
    { isConfirmed: true },
    { new: true }
  );
  if (user.isConfirmed) {
    await pharIdModel.updateOne({ pharId }, { pharName, isLinked: true });
  }
  if (!user) {
    return next(new Error("Account not found"));
  }
  return res.send("congratulations, your account is now activated");
})

//====================================================================================================================//

//new confirm email
export const newConfirmEmail = asyncHandler(async (req, res, next) => {
  const { emailToken } = req.params;

  const { email, pharId, pharName } = verifyToken({
    payload: emailToken,
    signature: process.env.EMAIL_TOKEN,
  });

  const newEmailToken = generateToken({
    payload: { email, pharId, pharName },
    signature: process.env.EMAIL_TOKEN,
    expiresIn: 60 * 2,
  });
  const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${newEmailToken}`;

  const refreshLink = `${req.protocol}://${req.headers.host}/auth/newConfirmEmail/${emailToken}`;

  const html = activationMailWithToken(link, refreshLink);

  const info = await sendEmail({
    to: email,
    subject: "Confirmation mail",
    html,
  });
  if (!info) {
    return next(new Error("Rejected Email", { cause: 400 }));
  }
  return res.status(200).send("Done ,check your inbox");
}
)
//====================================================================================================================//
//forget password
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await pharModel.findOne({ email });
  if (!user) {
    return next(new Error("User not found!", { cause: 404 }));
  }

  const forgetPasswordToken = generateToken({
    payload: { email: user.email, userId: user._id },
    signature: process.env.FORGET_PASSWORD_SIGNATURE,
    expiresIn: 60 * 5,
  });
  const link = `${req.protocol}://${req.headers.host}/auth/resetPassword/${forgetPasswordToken}`;
  const html = passwordEmail(link);

  const info = await sendEmail({
    to: email,
    subject: "Forget Password",
    html,
  });
  if (!info) {
    return next(new Error("Rejected Email", { cause: 400 }));
  }
  return res.status(200).json({
    status: "success",
    message: "Reset email password sent to your account",
  });
});

//====================================================================================================================//
//reset password
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { fp_token } = req.params;
  const { password } = req.body;

  const { email } = verifyToken({
    payload: fp_token,
    signature: process.env.FORGET_PASSWORD_SIGNATURE,
  });
  const user = await pharModel.findOne({ email });
  const match = compare({ plainText: password, hashValue: user.password });

  if (match) {
    return next(
      new Error("New password can't be old password", { cause: 400 })
    );
  }
  await pharModel.updateOne(
    { email },
    {
      password: Hash({ plainText: password }),
      changeAccountInfo: Date.now(),
      status: "not Active",
    }
  );

  return res.send("Password updated successfully");
})
//====================================================================================================================//
//forget password By OTP
export const forgetPasswordOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await pharModel.findOne({ email });
  if (!user) {
    return next(new Error("User not found!", { cause: 404 }));
  }
  const OTP = otp();
  await pharModel.findOneAndUpdate(
    { email },
    {
      otp: Hash({ plainText: OTP }),
      otpexp: moment().add(1, "day"),
    }
  );
  // const redirectLink = `${req.protocol}://${req.headers.host}/auth/resetPasswordOTP/?email={email}`;
  // const redirectLink = `${process.env.HOST}/register`;

  const html = otpEmail(OTP);
  const info = await sendEmail({
    to: email,
    subject: "Forget Password otp",
    html,
  });
  if (!info) {
    return next(new Error("Rejected Email", { cause: 400 }));
  }
  return res.status(200).json({
    status: "success",
    message: "OTP code have been sent to your account",
  });
});
//====================================================================================================================//
//reset password by otp

export const resetPasswordOTP = asyncHandler(async (req, res, next) => {
  const { otp, password ,email} = req.body;
  const user = await pharModel.findOne({ email });
  if (!user) {
    return next(new Error("User not found!", { cause: 404 }));
  }
  if (moment().diff(user.otpexp, "hours") >= 0) {
    return next(new Error(`OTP code has been Expired`, { cause: 410 }));
  }

  const matchOTP = compare({ plainText: otp, hashValue: user.otp });
  if (matchOTP) {
    (user.password = Hash({ plainText: password })), (user.otp = undefined);
    user.otpexp = undefined;
    user.changeAccountInfo = Date.now();
    user.status = "not Active";
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Password has been changed successfully",
    });
  }
  return next(new Error(`Invalid OTP code`, { cause: 409 }));
});

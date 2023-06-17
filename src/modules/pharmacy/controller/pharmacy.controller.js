import moment from "moment/moment.js";
import pharModel from "../../../../DB/models/Phar.model.js";
import { accountRecoveryEmail } from "../../../utils/Emails/accountRecoveryEmail.js";
import sendEmail from "../../../utils/Emails/sendEmail.js";
import { Hash, compare } from "../../../utils/Hash&Compare.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import {
  generateToken,
  verifyToken,
} from "../../../utils/generateAndVerifyToken.js";
import cloudinary from "../../../utils/cloudinary.js";
import medicineModel from "../../../../DB/models/medicine.model.js";

//user profile
export const profile = asyncHandler(async (req, res, next) => {
  let user = await pharModel
    .findById(req.user._id)
    .select(
      "-password -status -role -isConfirmed -isDeleted -isBlocked -wishlist -createdAt -updatedAt"
    ).populate("wishlist");
  return res
    .status(200)
    .json({ status: "success", message: "User Profile", result: user });
});



//====================================================================================================================//
//update user
export const updateUser = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    pharName,
    phone,
    address,
    gender,
    age,
  } = req.body;
  if (
    !(
      firstName ||
      lastName ||
      pharName ||
      phone ||
      address ||
      gender ||
      age
    )
  ) {
    return next(new Error("We need information to update", { cause: 400 }));
  }

  const checkUser = await pharModel.findById({ _id: req.user._id });

  // const object = { ...req.body };

  // for (let key in object) {
  //   if (checkUser[key] == object[key]) {
  //     return next(
  //       new Error(
  //         `I'm sorry, but we cannot update your ${key} with your old one. Please make sure that ${key} you have entered correctly and try again.`,
  //         { cause: 400 }
  //       )
  //     );
  //   }
  // }


  if (checkUser.isDeleted == true) {
    return next(
      new Error(
        "Can't update your information because your account may be suspended or deleted",
        { cause: 400 }
      )
    );
  }
  const user = await pharModel.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  });
  return res
    .status(200)
    .json({ status: "success", message: "User updated", result: user });
});
//====================================================================================================================//
//update password
export const changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const matchOld = compare({
    plainText: oldPassword,
    hashValue: req.user.password,
  });
  if (!matchOld) {
    return next(new Error("In-valid password", { cause: 409 }));
  }
  const checkMatchNew = compare({
    plainText: newPassword,
    hashValue: req.user.password,
  });
  if (checkMatchNew) {
    return next(
      new Error("New password can't be old password", { cause: 400 })
    );
  }

  const user = await pharModel.findOne({ _id: req.user._id });
  if (user.isDeleted == true) {
    return next(
      new Error(
        "Can't update your password because your account may be suspended or deleted",
        { cause: 400 }
      )
    );
  }

  user.password = Hash({ plainText: newPassword });
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Password updated successfully",
    result: user,
  });
});
//====================================================================================================================//
//deleteUser
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await pharModel
    .findByIdAndUpdate(
      req.user._id,
      { isDeleted: true, changeAccountInfo: Date.now(), status: "not Active" },
      { new: true }
    )
    .select("email isDeleted permanentlyDeleted");
  user.permanentlyDeleted = moment().add(1, "month").calendar();
  await user.save();
  const reactiveToken = generateToken({
    payload: { email: user.email },
    signature: process.env.RECOVER_ACCOUNT_SIGNATURE,
    expiresIn: 60 * 60 * 24 * 30,
  });

  const link = `${req.protocol}://${req.headers.host}/phar/accountRecovery/${reactiveToken}`;
  const html = accountRecoveryEmail(link);
  if (
    !(await sendEmail({ to: user.email, subject: "reactivate account", html }))
  ) {
    return next(new Error("Something went wrong", { cause: 400 }));
  }
  return res.status(200).json({
    status: "success",
    message:
      "The account has been successfully disabled, you have 30 days to recover it or it will be permanently deleted.",
  });
});
//====================================================================================================================//
//recover account
export const accountRecovery = asyncHandler(async (req, res, next) => {
  const { reactiveToken } = req.params;
  const decoded = verifyToken({
    payload: reactiveToken,
    signature: process.env.RECOVER_ACCOUNT_SIGNATURE,
  });
  const user = await pharModel.updateOne(
    { email: decoded.email, isDeleted: true },
    { isDeleted: false, $unset: { permanentlyDeleted: 1 }, status: "Active" }
  );
  if (user.matchedCount == 0) {
    return next(new Error("Account may be already active", { cause: 410 }));
  }

  return res.status(200).json({
    status: "success",
    message: "Your account recoverd successfully",
    result: user,
  });
});
//====================================================================================================================//
//profile pic
export const uploadProfilePic = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(
      new Error("Please select your profile picture", { cause: 400 })
    );
  }
  if (req.file.size > 1 * 1000 * 1000) {
    return next(
      new Error(
        `Maximum Profile picture size to upload is 1 MB , and yours is ${(
          req.file.size / 1000000
        ).toFixed(2)} MB`,
        { cause: 413 }
      )
    );
  }
  const user = await pharModel.findById(req.user._id);

  const profilePic = await cloudinary.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/users/${user._id}/profile`,
    public_id: `${user._id}profilePic`,
  });
  user.profileURL = profilePic.secure_url;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Profile Picture uploaded successfully",
    user: user,
  });
});
//====================================================================================================================//
//cover pic uploadCoverPic
export const uploadCoverPic = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("Please select your cover picture", { cause: 400 }));
  }
  if (req.file.size > 1 * 1000 * 1000) {
    return next(
      new Error(
        `Maximum Cover picture size to upload is 1 MB , and yours is ${(
          req.file.size / 1000000
        ).toFixed(2)} MB`,
        { cause: 413 }
      )
    );
  }
  const user = await pharModel.findById(req.user._id);

  const coverPic = await cloudinary.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/users/${user._id}/cover`,
    public_id: `${user._id}coverPic`,
  });
  user.coverURL = coverPic.secure_url;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Cover Picture uploaded successfully",
    user: user,
  });
});

//====================================================================================================================//
//share Profile
export const shareProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await pharModel
    .findById(id)
    .select("-password -status -role -isConfirmed -isDeleted -isBlocked -wishlist -createdAt -updatedAt");
    const medicinies = await medicineModel.find({createdBy:id})
  return user
    ? res.status(200).json({ message: "Success", user , medicinies })
    : next(new Error("In-valid ID account", { cause: 404 }));
})
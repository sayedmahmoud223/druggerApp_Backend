import { asyncHandler } from "../../utils/errorHandling.js";
import { fileUpload } from "../../utils/multerCloudinary.js";
import * as medicineController from "./controller/medicine.controller.js";
import Router from "express";
import { auth, roles } from "../../middlewares/auth.middleware.js";
import { endPoint } from "./controller/medicine.endPoint.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import medicineRouter from "../comment/comment.router.js";
import {
  addMedicineSchema,
  addMedicineToWishListSchema,
  deleteMedicineSchema,
  removeMedicineFromWishListSchema,
  updateMedicineSchema,
} from "./controller/medicine.validation.js";
const router = Router();

router.use("/:medicineId/comments", medicineRouter);

//get all medicine
router.get("/", asyncHandler(medicineController.getAllMedicine));

//add medicine
router.post(
  "/",
  auth(endPoint.create),
  fileUpload(2).fields([{ name: "medicineImage", maxCount: 1 }]),
  isValid(addMedicineSchema),
  asyncHandler(medicineController.addMedicine)
);

//get user medicines
router.get("/usermedicine",auth(endPoint.create), asyncHandler(medicineController.getAllMedicineOfUser));

//update medicine
router.put(
  "/:medicineId/updateMedicine",
  auth(endPoint.update),
  fileUpload(2).fields([{ name: "medicineImage", maxCount: 1 }]),
  isValid(updateMedicineSchema),
  asyncHandler(medicineController.updateMedicine)
);

//delete medicine
router.patch(
  "/:medicineId",
  auth(endPoint.delete),
  isValid(deleteMedicineSchema),
  asyncHandler(medicineController.deleteMedicine)
);

//add medicine to wish list
router.patch(
  "/:medicineId/wishList",
  auth(endPoint.update),
  isValid(addMedicineToWishListSchema),
  asyncHandler(medicineController.addMedicineToWishList)
);

//remove medicine from wish list
router.patch(
  "/:medicineId/removeWishList",
  auth(endPoint.delete),
  isValid(removeMedicineFromWishListSchema),
  asyncHandler(medicineController.removeMedicineFromWishList)
);


router.get("/getSpecificMedicine/:medicineId",
isValid(removeMedicineFromWishListSchema), 
asyncHandler(medicineController.getSpacificMedicine))

export default router;

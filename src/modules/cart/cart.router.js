import Router from "express";
import * as cartController from "./controller/cart.controller.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { endPoint } from "./controller/cart.endPoint.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import { cart, headersSchema, selectItems, updateQuantity } from "./controller/cart.validation.js";
const router = Router();
//Get All Product
router.get(
  "/getAllProducts",
  isValid(headersSchema , true),
  auth(endPoint.createCart),
  asyncHandler(cartController.getProductFromCart)
);

//add cart
router.post(
  "/",
  isValid(headersSchema , true),
  auth(endPoint.createCart),
  isValid(cart),
  asyncHandler(cartController.addCart)
);
router.patch("/updateQuantity/:medicineId",
 isValid(headersSchema , true),
auth(endPoint.createCart),
isValid(updateQuantity),
asyncHandler(cartController.updateQuantity));

//clear all cart
router.put(
  "/clearAll",
  isValid(headersSchema , true),
  auth(endPoint.createCart),
  asyncHandler(cartController.clearAllCart)
);

//clear selected items
router.patch(
  "/clearSelectItems",
  isValid(headersSchema , true),
  auth(endPoint.createCart),
  isValid(selectItems),
  asyncHandler(cartController.deletedSelectItemsFromCart)
);

export default router;

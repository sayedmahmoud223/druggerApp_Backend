import Router from "express"
import * as orderController from "./controller/order.controller.js"
import { asyncHandler } from "../../utils/errorHandling.js"
import { auth } from "../../middlewares/auth.middleware.js"
import { endPoint } from "./controller/order.endPoint.js"
import { isValid } from "../../middlewares/validation.middleware.js"
import {   cancel_Order, createorder_Validation, delivered_Order, headersSchema ,} from "./controller/order.validation.js"

const router =Router()
//create order
router.post(
  "/createOrder",
  isValid(headersSchema , true),
  auth(endPoint.create),
  isValid(createorder_Validation),
  asyncHandler(orderController.createOrder)
); 

//deliver order
router.patch(
  "/:orderId/deliveredOrder",
  isValid(headersSchema , true),
  auth(endPoint.deliverdAndShipped),
  isValid(delivered_Order),
  asyncHandler(orderController.deliverOrder)
);

//shipped order
router.patch(
  "/:orderId/shippedOrder",
  isValid(headersSchema , true),
  auth(endPoint.deliverdAndShipped),
  isValid(delivered_Order),
  asyncHandler(orderController.shippedOrder)
);

//cancel order
router.patch(
  "/:orderId/cancelOrder",
  isValid(headersSchema , true),
  auth(endPoint.create),
  isValid(cancel_Order),
  asyncHandler(orderController.cancelOrder)
); 

router.get("/userOrder",auth(endPoint.create), asyncHandler(orderController.getAllOrders))
 

export default router
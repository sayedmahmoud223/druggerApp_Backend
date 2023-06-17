import Joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";


export const headersSchema= generalFeilds.headers

export const createorder_Validation = Joi.object({
    phone:Joi.array().items(generalFeilds.phone),
    address: Joi.string(),
    products:Joi.array().items(Joi.object({
        medicineId:generalFeilds.id,
        name:generalFeilds.ProductName.required(),
        description:generalFeilds.description,
        quantity:generalFeilds.quantity.required(),
        unitPrice:generalFeilds.price,
        finalPrice:generalFeilds.price,
    })),
    paymentType:Joi.string()


   
}).required()


export const delivered_Order = Joi.object({
    orderId :generalFeilds.id
}).required()

export const cancel_Order = Joi.object({
    orderId :generalFeilds.id,
    reason:Joi.string().min(5)
}).required()
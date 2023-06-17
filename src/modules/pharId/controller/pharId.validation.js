import joi from "joi"
import { generalFeilds } from "../../../middlewares/validation.middleware.js"

export const headersSchema= generalFeilds.headers

export const addPharIdSchema= joi.object(
    {
        pharId:joi.string().length(10)
    }
).required()
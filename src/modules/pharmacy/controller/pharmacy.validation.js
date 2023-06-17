import joi from "joi"
import { generalFeilds } from "../../../middlewares/validation.middleware.js"

export const headersSchema= generalFeilds.headers

export const updateUserSchema=joi.object(
    {
// <<<<<<< HEAD
        // firstName:generalFeilds.userName,
        // lastName:generalFeilds.userName,
        // pharName:generalFeilds.userName,
// =======
        firstName:generalFeilds.firstName,
        lastName:generalFeilds.lastName,
        pharName:generalFeilds.pharName,
// >>>>>>> 4d92213b6f2bca011ed034748454062cdd6f077c
        address:joi.string(),
        phone:generalFeilds.phone,
        age:generalFeilds.age,
        gender:generalFeilds.gender
    }
).required()

export const changePasswordSchema=joi.object(
    {
        oldPassword:generalFeilds.password,
        newPassword:generalFeilds.password
    }
).required()

export const shareProfileSchema = joi
  .object({
    id: generalFeilds.id,
  })
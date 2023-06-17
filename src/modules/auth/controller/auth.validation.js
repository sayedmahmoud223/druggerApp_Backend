import joi from 'joi'
import { generalFeilds } from '../../../middlewares/validation.middleware.js'

export const headersSchema= generalFeilds.headers

export const authRegisterSchema= joi.object(
    {
        pharId: joi.string().length(10).required(),

        pharName:generalFeilds.pharName.required(),

        firstName:generalFeilds.firstName.required(),
// <<<<<<< HEAD
      
// =======
// >>>>>>> 4d92213b6f2bca011ed034748454062cdd6f077c

        lastName:generalFeilds.lastName.required(),

        email: generalFeilds.email.required(),

        password:generalFeilds.password.required(),

        cPassword:generalFeilds.cPassword.valid(joi.ref("password")).required(),
    }
).required()

export const logInSchema=joi.object(
    {
        pharId: joi.string().length(10).required(),

        email:generalFeilds.email.required(),

        password:generalFeilds.password.required()
    }
).required()

export const forgetPasswordSchema=joi.object(
    {
        email:generalFeilds.email
    }
).required()

export const resetPasswordSchema=joi.object(
    {
        fp_token:generalFeilds.token,
        password:generalFeilds.password
    }
).required()

export const resetPasswordOTPSchema=joi.object(
    {
        email:generalFeilds.email,
        password:generalFeilds.password,
        otp:generalFeilds.otp
    }
).required()
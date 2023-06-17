import joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export let addMedicineSchema = joi
  .object({
    medicineName: joi.string().min(3).max(500).required(),
    medicineDesc: joi.string().min(3).max(15000),
    file: joi
      .object({
        medicineImage: joi
          .array()
          .items(generalFeilds.file)
          .length(1)
          .required(),
      })
      .required(),
    medicineExpireDate: joi.date().greater(Date.now()).required(),
    medicineUnitPrice: joi.number().required(),
    medicineStock: joi.number().required(),
    medicineType: joi
      .string()
      .min(3)
      .max(50)
      .valid(
        "Capsules",
        "Tablets",
        "Injections",
        "Syrups",
        "Inhalers",
        "Topical preparations",
        "Drops",
        "Powders",
        "Sprays",
        "Solutions"
      )
  })
  .required();

  
export let updateMedicineSchema = joi
  .object({
    medicineId: generalFeilds.id, medicineName: joi.string().min(3).max(500).required(),
    medicineDesc: joi.string().min(3).max(15000),
    file: joi
      .object({
        medicineImage: joi
          .array()
          .items(generalFeilds.file)
          .length(1)
      })
      .required(),
    medicineExpireDate: joi.date().greater(Date.now()),
    medicineUnitPrice: joi.number(),
    medicineStock: joi.number(),
    medicineType: joi
      .string()
      .min(3)
      .max(50)
      .valid(
        "Capsules",
        "Tablets",
        "Injections",
        "Syrups",
        "Inhalers",
        "Topical preparations",
        "Drops",
        "Powders",
        "Sprays",
        "Solutions"
      )
  })
  .required();


export let deleteMedicineSchema = joi
  .object({
    medicineId: generalFeilds.id,
  })
  .required();


  
export let addMedicineToWishListSchema = joi
  .object({
    medicineId: generalFeilds.id,
  })
  .required();


export let removeMedicineFromWishListSchema = joi
  .object({
    medicineId: generalFeilds.id,
  })
  .required();



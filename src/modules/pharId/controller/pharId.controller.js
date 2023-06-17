import pharIdModel from "../../../../DB/models/PharId.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";

export const addPharId=asyncHandler(async(req,res,next)=>
{

    const {pharIDs}=req.body
    const addPharId = await pharIdModel.insertMany(pharIDs)
    return res.status(201).json({message:"Done",addPharId})
})
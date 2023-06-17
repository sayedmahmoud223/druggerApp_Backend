import { nanoid } from "nanoid";
import slugify from "slugify";
import cloudinary from "../../../utils/cloudinary.js";
import medicineModel from "../../../../DB/models/medicine.model.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";
import pharModel from "../../../../DB/models/Phar.model.js";

//get all medicine
export let getAllMedicine = async (req, res, next) => { 
  let {type} = req.query
  console.log(type);
  const apiObject = new ApiFeatures(
    medicineModel.find().populate([
      // {
      //   path: "comments",
      //   populate: [
      //     { path: "createdBy", select: "phone email pharName profileURL" },
      //     {
      //       path: "reply",
      //       populate: {
      //         path: "createdBy",
      //         select: "phone email pharName profileURL",
      //       }
      //     },
      //     {
      //       path: "like",
      //       select: "phone email pharName profileURL",
      //     },
      //     {
      //       path: "unlike",
      //       select: "phone email pharName profileURL",
      //     },
      //   ],
      // },
      {
        path: "comments",
        populate: [
          { 
            path: "createdBy", 
            select: "phone email pharName profileURL" 
          },
          {
            path: "replyComment",
            populate: {
              path: "createdBy",
              select: "phone email pharName profileURL",
            }
          },
          {
            path: "reply",
            populate: {
              path: "like",
              select: "phone email pharName profileURL",
            }
          },
          {
            path: "reply",
            populate: {
              path: "unlike",
              select: "phone email pharName profileURL",
            }
          },
          {
            path: "like",
            select: "phone email pharName profileURL",
          },
          {
            path: "unlike",
            select: "phone email pharName profileURL",
          },
        ],
      },      
      {
        path: "wishUsers",
        select: " phone email pharName profileURL",
      },
    ]),
    req.query
  )
    .paginate()
    .filter()
    .search()
    .sort()
    .select();
  const medicines = await apiObject.mongooseQuery;
  let medicineCount = medicines.length

  
  return res.status(200).json({ message: "success", medicineCount, medicines });
};
//====================================================================================================================//
//get user medicines
export let getAllMedicineOfUser = async (req, res, next) => {
  const Usermedicines = await medicineModel.find({createdBy:req.user._id})
  return res.status(200).json({ message: "success", Usermedicines});
};
//====================================================================================================================//
//add medicine

export let addMedicine = async (req, res, next) => {
  let { _id } = req.user;
  let { medicineName } = req.body;
  req.body.medicineSlug = slugify(medicineName);
  req.body.customId = nanoid();
  let Image = await cloudinary.uploader.upload(
    req.files.medicineImage[0].path,
    {
      folder: `${process.env.APP_NAME}/medicines/${req.body.customId}/medicineImage`,
      public_id: `${req.body.customId}medicinePic`,
    }
  );
  req.body.medicineImage = Image.secure_url;
  req.body.createdBy = _id;
  let medicine = await medicineModel.create(req.body);
  return res.status(201).json({ message: "success", medicine });
};

//====================================================================================================================//
//update medicine
export let updateMedicine = async (req, res, next) => {
  let { _id } = req.user;
  let { medicineId } = req.params;
  let medicine = await medicineModel.findOne({
    _id: medicineId,
    createdBy: _id,
  });
  if (!medicine) {
    return next(new Error("in-valid medicine id"));
  }
  if (req.body.medicineName) {
    req.body.medicineSlug = slugify(req.body.medicineName);
  }

  if (req.files?.medicineImage?.length) {
    let image = await cloudinary.uploader.upload(
      req.files.medicineImage[0].path,
      {
        folder: `${process.env.APP_NAME}/medicines/${medicine.customId}/medicineImage`,
        public_id: `${medicine.customId}medicinePic`,
      }
    );
    req.body.medicineImage = image.secure_url;
  }
  let updateMedicine = await medicineModel.updateOne(
    { _id: medicineId },
    req.body,
    { new: true }
  );
  return res.status(200).json({ message: "success", updateMedicine });
};

//====================================================================================================================//
//delete medicine
export let deleteMedicine = async (req, res, next) => {
  let { _id } = req.user;
  let { medicineId } = req.params;
  let medicine = await medicineModel.findOneAndUpdate(
    { _id: medicineId, createdBy: _id },
    { isDeleted: true }
  );
  if (!medicine) {
    return next(new Error("in-valid medicine to remove"));
  }
  return res.status(200).json({ message: "success", medicine });
};

//====================================================================================================================//
//add medicine to wish list
export let addMedicineToWishList = async (req, res, next) => {
  let { _id } = req.user;
  console.log(_id);
  let { medicineId } = req.params;
  let medicine = await medicineModel.findOne({
    _id: medicineId,
    isDeleted: "false",
  });
  if (!medicine) {
    return next(new Error("in-valid medicine to remove"));
  }
  let pharmecy = await pharModel.findOneAndUpdate(
    { _id },
    { $addToSet: { wishlist: medicine._id } },
    { new: true }
  );
  return res.status(200).json({ message: "success", pharmecy });
};

//====================================================================================================================//
//remove medicine from wish list
export let removeMedicineFromWishList = async (req, res, next) => {
  let { _id } = req.user;
  let { medicineId } = req.params;
  let medicine = await medicineModel.findOne({
    _id: medicineId,
    isDeleted: "false",
  });
  if (!medicine) {
    return next(new Error("in-valid medicine to remove"));
  }
  let pharmecy = await pharModel.findOneAndUpdate(
    { _id },
    { $pull: { wishlist: medicineId } },
    { new: true }
  );

  return res.status(200).json({ message: "success", pharmecy });
};

//------------------------------------------------------------------------------------------------------------------//

export const getSpacificMedicine = async (req,res,next)=>{
  const {medicineId} = req.params

  const medicine = await medicineModel.findOne({_id:medicineId}).populate([
    { path: "createdBy" , select: "phone email pharName profileURL address lastName firstName age"
    },
    {
      path: "comments",
      populate: [
        { path: "createdBy", select: "phone email pharName profileURL " },
        {
          path: "reply",
          populate: [
            {
              path: "like",
              select: "phone email pharName profileURL",
            },
            {
              path: "unlike",
              select: "phone email pharName profileURL",
            },
          ],
        },
        {
          path: "like",
          select: "phone email pharName profileURL",
        },
        {
          path: "unlike",
          select: "phone email pharName profileURL",
        },
      ],
    },
    {
      path: "wishUsers",
      select: " phone email pharName profileURL",
    },
  ])
  if(!medicine)
  {
    return next (new Error("in-vaild medicine id",{cause:400}))
  }

  return res.status(200).json({message:"Done" , medicine})

}

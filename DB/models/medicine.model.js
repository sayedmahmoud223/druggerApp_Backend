import mongoose, { Schema, Types, model } from "mongoose";

const medicineSchema = new Schema({
  medicineName: { type: String, required: true, lowerCase: true, trim: true },
  medicineSlug: { type: String, required: true },
  customId: { type: String, required: true },
  medicineImage: { type: String, required: true },
  medicineType: {
    type: String,
    default: "Syrups",
    enum: [
      "Capsules",
      "Tablets",
      "Injections",
      "Syrups",
      "Inhalers",
      "Topical preparations",
      "Drops",
      "Powders",
      "Sprays",
      "Solutions",
    ],
  },
  medicineExpireDate: { type: Date, required: true },
  medicineDesc: { type: String, min: 3, required: true },
  medicineStock: { type: Number, default: 1, required: true },
  medicineUnitPrice: { type: Number, required: true, default: 0 },
  wishUsers: [{ type: Types.ObjectId, ref: "Phar" }],
  comments: [{ type: Types.ObjectId, ref: "Comment" }],
  createdBy: { type: Types.ObjectId, ref: "Phar", required: true },
  isDeleted: { type: Boolean, default: false },
},
{
  timestamps:true,
  
});





medicineSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

medicineSchema.virtual("medicineImageId").get(function () {
  return `${process.env.APP_NAME}/medicine/${this._id}/medicineImage/${this._id}medicineImage`;
});

const medicineModel =
  mongoose.models.Medicine || model("Medicine", medicineSchema);
export default medicineModel;

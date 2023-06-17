import mongoose, { Schema, model, Types } from "mongoose";

const cartSchema = new Schema(
  {
    createdBy: { type: Types.ObjectId, ref: "Phar", required: true },
    products: [
      {
        medicineId: { type: Types.ObjectId, ref: "Medicine", required: true },
        quantity: { type: Number, default: 1 },
      }
    ],
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

cartSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

const cartModel = mongoose.models.Cart || model("Cart", cartSchema);
export default cartModel;

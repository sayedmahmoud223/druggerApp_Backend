import mongoose, { model, Schema, Types } from "mongoose";

const orderSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "Phar", required: true },
    address: [String],
    phone: [String],
    products: [
      {
        medicineId: { type: Types.ObjectId, ref: "Medicine", required: true },
        name: { type: String, required: true },
        description: { type: String, required: false}, /// turn in to true 
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 1 },
        finalPrice: { type: Number, default: 1 },
      },
    ],
    note: String,
    reason: String,
    totalFinalPrice: { type: Number, default: 1 },
    status: {
      type: String,
      default: "Pending",
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Rejected",
        "On hold",
      ],
    },
    paymentType: {
      type: String,
      default: "COD",
      enum: ["COD", "Card", "PayPal", "E-wallets"],
    },
    invoice:{
      url:String,
      id:String
    },

    updatedBy: { type: Types.ObjectId, ref: "Phar" },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

const orderModel = mongoose.models.Order || model("Order", orderSchema);
export default orderModel;

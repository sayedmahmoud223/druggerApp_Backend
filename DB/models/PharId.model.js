import mongoose, { Schema, model, Types } from "mongoose";

const pharIdSchema = new Schema(
  {
    pharName: String,
    pharId: { type: String, unique: true },
    isLinked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const pharIdModel = mongoose.models.PharId || model("PharId", pharIdSchema);
export default pharIdModel;


import mongoose, { Schema, model, Types } from "mongoose";

const commentSchema = new Schema(
  {
    createdBy: { type: Types.ObjectId, ref: "Phar", required: true },
    medicineId: { type: Types.ObjectId, ref: "Medicine", required: true },
    commentDesc: { type: String, required: true },
    like: [{ type: Types.ObjectId, ref: "Phar" }],
    unlike: [{ type: Types.ObjectId, ref: "Phar" }],
    reply: [{ type: Types.ObjectId, ref: "Comment" }],
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

commentSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

const commentModel = mongoose.models.Comment || model("Comment", commentSchema);
export default commentModel;

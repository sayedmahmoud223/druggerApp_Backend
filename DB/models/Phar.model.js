import mongoose, { model, Schema, Types } from "mongoose";

const pharSchema = new Schema(
  {
    pharId: String,
// <<<<<<< HEAD

// =======
// >>>>>>> 4d92213b6f2bca011ed034748454062cdd6f077c
    firstName: {
      type: String,
      min: 3,
      max: 20,
      required: [true, "firstName is required"],
    },
    lastName: {
      type: String,
      min: 3,
      max: 20,
      required: [true, "lastName is required"],
    },
    pharName: {
      type: String,
      min: 3,
      max: 20,
      lowercase: true,
      required: [true, "pharName is required"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    
    age: {
      type: Number,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String
    },
    address: {
      type: String,
    },
    status: {
      type: String,
      default: "not Active",
      enum: ["Active", "not Active"],
    },
    role: {
      type: String,
      default: "user",
      enum: ["superAdmin", "admin", "user"],
    },
    gender: {
      type: String,
      default: "male",
      enum: ["male", "female"],
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    wishlist: [{ type: Types.ObjectId, ref: "Medicine" }],
    activationCode: String,
    otp: String,
    otpexp: Date,
    permanentlyDeleted: Date,
    profileURL: String,
    changeAccountInfo: Date,
  },
  { timestamps: true }
);
pharSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

pharSchema.virtual("profilePicId").get(function () {
  return `${process.env.APP_NAME}/users/${this._id}/profile/${this._id}profilePic`;
});

const pharModel = mongoose.models.Phar || model("Phar", pharSchema);
export default pharModel;

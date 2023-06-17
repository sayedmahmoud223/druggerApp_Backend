import commentModel from "../../../../DB/models/Comment.model.js";
import medicineModel from "../../../../DB/models/medicine.model.js";


//create comment
export let createComment = async (req, res, next) => {
  let { medicineId } = req.params;
  let { commentDesc } = req.body;
  let medicine = await medicineModel.findOne({ _id: medicineId });
  if (!medicine) {
    return next(new Error("in-valid medicine id", { cause: 400 }));
  }
  let comment = await commentModel.create({
    createdBy: req.user._id,
    medicineId,
    commentDesc,
  });
  medicine.comments.push(comment._id);
  await medicine.save();
  return res.status(201).json({ message: "Done", comment });
};

//====================================================================================================================//
//update comment
export let updateComment = async (req, res, next) => {
  let { medicineId, commentId } = req.params;
  let comment = await commentModel.findOne({
    _id: commentId,
    medicineId,
    createdBy: req.user._id,
  });
  if (!comment) {
    return next(new Error("in-valid medicine id", { cause: 400 }));
  }
  if (req.body.commentDesc) {
    comment.commentDesc = req.body.commentDesc;
  }

  return res.status(201).json({ message: "Done", comment });
};

//====================================================================================================================//
//add like
export let addlike = async (req, res, next) => {
  let { medicineId, commentId } = req.params;
  let comment = await commentModel.findOneAndUpdate(
    { _id: commentId, medicineId },
    { $addToSet: { like: req.user._id }, $pull: { unlike: req.user._id } },
    { new: true }
  );
  return res.status(201).json({ message: "Done", comment });
};

//====================================================================================================================//
//un like
export let unlike = async (req, res, next) => {
  let { medicineId, commentId } = req.params;
  let comment = await commentModel.findOneAndUpdate(
    { _id: commentId, medicineId },
    { $addToSet: { unlike: req.user._id }, $pull: { like: req.user._id } },
    { new: true }
  );
  return res.status(201).json({ message: "Done", comment });
};

//====================================================================================================================//
//create reply
export let createReplyComment = async (req, res, next) => {
  let { medicineId, commentId } = req.params;
  let { commentDesc } = req.body;
  let comment = await commentModel.findOne({ _id: commentId, medicineId });
  if (!comment) {
    return next(new Error("in-valid comment id", { cause: 400 }));
  }
  let replyComment = await commentModel.create({
    commentDesc,
    medicineId,
    createdBy: req.user._id,
  });
  comment.reply.push(replyComment);
  await comment.save();
  return res.status(201).json({ message: "Done", replyComment });
};

import multer from "multer";
const fileValidation = () => {
  return (req, file, cb) => {
    if (
      (file.fieldname === "medicineImage" && (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/jpg"))
    ) {
      return cb(null, true);
    } else {
      return cb(new Error("In-Valid format", { cause: 400 }), false);
    }
  };
};

export function fileUpload(size) {
  const storage = multer.diskStorage({});
  const limits = { fileSize: size * 1000 * 1000 };
  const fileFilter = fileValidation();
  const upload = multer({ fileFilter, storage, limits });
  return upload;
}


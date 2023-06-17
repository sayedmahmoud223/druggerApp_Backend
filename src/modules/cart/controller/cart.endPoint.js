import { roles } from "../../../middlewares/auth.middleware.js";

export const endPoint = {
  createCart: [roles.User,roles.Admin,roles.SuperAdmin],
};

import { roles } from "../../../middlewares/auth.middleware.js";

export const endPoint = {
  create: [roles.User , roles.Admin , roles.SuperAdmin],
  update: [roles.User , roles.Admin , roles.SuperAdmin],
  delete: [roles.User, roles.Admin, roles.SuperAdmin],
  deliverdAndShipped: [roles.Admin, roles.SuperAdmin],
};

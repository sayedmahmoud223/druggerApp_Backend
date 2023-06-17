import { roles } from "../../../middlewares/auth.middleware.js";

export const endPoint = {
    create: [roles.User],
    update: [roles.User],
    delete: [roles.User, roles.Admin, roles.SuperAdmin],
};

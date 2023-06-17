import connectDB from "../DB/connection.js";
import cors from "cors"
import { glopalErrHandling } from "./utils/errorHandling.js";
import pharIdRouter from "./modules/pharId/pharId.router.js";
import authRouter from "./modules/auth/auth.router.js";
import pharRouter from "./modules/pharmacy/pharmacy.router.js";
import medicineRouter from "./modules/medicine/medicine.router.js";
import cartRouter from "./modules/cart/cart.router.js";
import orderRouter from "./modules/order/order.router.js"
import morgan from "morgan";


const initApp = (app, express) => {

  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json({}));
  //routes
  app.use("/pharId", pharIdRouter);

  app.use("/auth", authRouter);

  app.use("/phar", pharRouter);

  app.use("/medicine", medicineRouter);

  app.use("/cart", cartRouter);
  
  app.use("/order", orderRouter);

  app.all("*", (req, res, next) => {
    return res.status(404).json({ message: "error 404 in-valid routing" });
  });

  app.use(glopalErrHandling);

  //connect DataBase
  connectDB();
};

export default initApp;

import cartModel from "../../../../DB/models/Cart.model.js";
import orderModel from "../../../../DB/models/Order.model.js";
import medicineModel from "../../../../DB/models/medicine.model.js";
import {
  clearAllCartItems,
  deletedSelectItems,
} from "../../cart/controller/cart.controller.js";
import { createInvoice } from "../../../utils/pdf.js";
import sendEmail from "../../../utils/Emails/sendEmail.js";
import cloudinary from "../../../utils/cloudinary.js";
import path from "path";
import { unlink } from "fs";
import { fileURLToPath } from "url";
import payment from "../../../utils/payment.js";

export const createOrder = async (req, res, next) => {
  const { address, phone, note, paymentType } = req.body;

  if (!req.body.products) {
    // check product from cart if not found products in req.body

    const cart = await cartModel.findOne({ createdBy: req.user.id });

    if (!cart?.products.length) {
      return next(new Error("Empty Cart", { cause: 400 }));
    }
    req.body.products = cart.products;
    req.body.isCart = true;
  }
  let sumTotal = 0;
  let finalProductList = [];
  let medicineIds = [];

  for (let product of req.body.products) {
    const checkProduct = await medicineModel.findOne({
      _id: product.medicineId,
      medicineStock: { $gte: product.quantity },
      isDeleted: false,
    });

    if (!checkProduct) {
      return next(
        new Error(`failed to add this Product `, { cause: 400 })
      );
    }
    medicineIds.push(product.medicineId);

    if (req.body.isCart) {
      product = product.toObject();
    }

    product.name = checkProduct.medicineName;

    product.unitPrice = checkProduct.medicineUnitPrice;
    product.finalPrice = product.unitPrice * product.quantity;
    product.description = checkProduct.medicineDesc;
    finalProductList.push(product);

    sumTotal += product.finalPrice;
  }
  const order = await orderModel.create({
    userId: req.user._id,
    products: finalProductList,
    address,
    phone,
    note,
    totalFinalPrice: sumTotal,
    paymentType,
  });

  if (!order) {
    return next(new Error("in-vaild order", { cause: 400 }));
  }

  // reduce quantity from DB
  for (let product of req.body.products) {
    await medicineModel.updateOne(
      { _id: product.medicineId },
      { $inc: { medicineStock: -parseInt(product.quantity) } }
    );
  }

  if (!req.body.products) {
    await clearAllCartItems(req.user._id);
  } else {
    //clear selected product from cart

    await deletedSelectItems(medicineIds, req.user._id);
  }
  //invoice pdf
  const invoice = {
    shipping: {
      name: req.user.firstName + " " + req.user.lastName,
      address: order.address,
      city: "Cairo",
      state: "Cairo",
      country: "Egypt",
      postal_code: 94111,
    },
    items: order.products,
    subtotal: sumTotal,
    Discount: 0,
    invoice_nr: order._id,
    finalPrice: order.totalFinalPrice,
    date: order.createdAt,
  };

  if (process.env.MOOD == "DEV") {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const pdfPath = path.join(
      __dirname,
      `../../../../src/invoices/invoice${invoice.invoice_nr}.pdf`
    );
    createInvoice(invoice, pdfPath);
    //upload invoice to cloudinary

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      pdfPath,
      {
        folder: `${process.env.APP_NAME}/order/invoice`,
        resource_type: "raw",
      }
    );

    if (secure_url) {
      order.invoice.url = secure_url;
      order.invoice.id = public_id;
      await order.save();

      unlink(pdfPath, (err) => {
        if (err) console.log(err);
        else {
          console.log("file deleted");
        }
      });
    }
    await sendEmail({
      to: req.user.email,
      subject: "Order Invoice",
      attachments: [
        {
          path: secure_url,
          contentType: "application/pdf",
        },
      ],
    });
  } else {
    const pdfPath = `/tmp/invoice${invoice.invoice_nr}.pdf`;
    createInvoice(invoice, pdfPath);

    //upload invoice to cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      pdfPath,
      {
        folder: `${process.env.APP_NAME}/order/invoice`,
        resource_type: "raw",
      }
    );

    if (secure_url) {
      order.invoice.url = secure_url;
      order.invoice.id = public_id;
      await order.save();
    }
    await sendEmail({
      to: req.user.email,
      subject: "Order Invoice",
      attachments: [
        {
          path: secure_url,
          contentType: "application/pdf",
        },
      ],
    });
  }

  if (["On hold", "Rejected", "Cancelled"].includes(order.status))
    return next(new Error(`order is ${order.status}`, { cause: 400 }));
  //start payment
  if (paymentType == "Card" && order.status == "Pending") {
    const session = await payment({
      payment_method_types: ["card"],
      mode: "payment",
      cancel_url: `${req.protocol}://${
        req.headers.host
      }/order/payment/cancel?orderId=${order._id.toString()}`,
      customer_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
      },
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: product.name,
            },
            unit_amount: product.unitPrice * 100,
          },
          quantity: product.quantity,
        };
      }),
    });

    order.status = "Processing";
    await order.save();

    return res.status(201).json({
      status: "success",
      message: "Order shipped successfully",
      Url: session.url,
      _id:order._id

    });
  } else if (["Delivered", "Shipped"].includes(order.status)) {
    return next(
      new Error("This order is already checked out ", { cause: 400 })
    );
  } else {
    order.status = "Shipped";
    await order.save();
    return res.status(201).json({
      status: "success",
      message: "Order placed successfully",
      result: order,
    });
  }
};

//====================================================================================================================//
// cancel order
export const cancelOrder = async (req, res, next) => {
  const orderId = req.params.orderId;
  const reason = req.body.reason;

  const order = await orderModel.findOne({ _id: orderId, userId: req.user.id });
  if (!order) {
    return next(new Error("in-vaild order", { cause: 400 }));
  }
  if (
    (order.status != "Pending" && order.paymentType == "COD") ||
    (order.status != "On hold" && order.paymentType !== "COD")
  ) {
    return next(
      new Error(
        `cannot cancel your order after it been chanced to ${order.status} by the system`,
        { cause: 400 }
      )
    );
  }
  //delete invoice from cloudinary
  await cloudinary.uploader.destroy(
    `${order.invoice.id}`,
    { resource_type: "raw" },
    function (error, result) {
      console.log(result, error);
    }
  );

  const canceledOrder = await orderModel.updateOne(
    { _id: orderId, userId: req.user.id },
    { status: "Cancelled", reason, $unset: { invoice: 1 } }
  );

  if (!canceledOrder.matchedCount) {
    return next(new Error(`fail to cancel your order`, { cause: 400 }));
  }

  for (const product of order.products) {
    await medicineModel.updateOne(
      { _id: product.medicineId },
      { $inc: { medicineStock: parseInt(product.quantity) } }
    );
  }

  return res
    .status(200)
    .json({ status: "success", message: "Order canceled successfully" });
};

//====================================================================================================================//
// deliver order
export const deliverOrder = async (req, res, next) => {
  const orderId = req.params.orderId;

  const order = await orderModel.findOneAndUpdate(
    {
      _id: orderId,
      status: { $nin: ["Delivered", "Cancelled", "Rejected", "On hold"] },
    },
    { status: "Delivered", updatedBy: req.user.id }
  );
  if (!order) {
    return next(new Error("in-vaild order", { cause: 400 }));
  }

  return res.status(200).json({ message: "  Done" });
};
//====================================================================================================================//
// shipped order
export const shippedOrder = async (req, res, next) => {
  const orderId = req.params.orderId;

  const order = await orderModel.findOneAndUpdate(
    {
      _id: orderId,
      status: {
        $nin: ["Delivered", "Cancelled", "Rejected", "On hold", "Pending"],
      },
      paymentType: { $ne: "COD" },
    },
    { status: "Shipped", updatedBy: req.user.id }
  );
  if (!order) {
    return next(new Error("in-vaild order", { cause: 400 }));
  }

  return res.status(200).json({ message: "  Done" });
};
//-------------------------------------------------------------------------------------------------
export let cancelPayment = async (req, res, next) => {
  let { orderId } = req.query
  console.log(orderId);
  let order = await orderModel.findOne({ _id: orderId })
  if (!order) return next(new Error(`in-valid order`, 400))
  for (let product of order.products) {
      await medicineModel.updateOne({ _id: product.productId }, { $inc: { stock: product.quantity } }, { new: true })
  }
  return res.redirect("https://chat.openai.com/")
}

//----------------------------------------------

export const getAllOrders=async(req,res,next)=>{

const orders = await orderModel.find({userId:req.user._id})

return res.json({message:"Done", orders})

}


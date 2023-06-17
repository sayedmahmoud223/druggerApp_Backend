import cartModel from "../../../../DB/models/Cart.model.js";
import medicineModel from "../../../../DB/models/medicine.model.js";







//get All Product in Cart

export const getProductFromCart=async(req,res,next)=>{
  let count=0 ;
  let totalPrice = 0;
  const cart = await cartModel.findOne({createdBy:req.user._id}).populate([
   
    {
      path:"products",
      populate: [
        { path:"medicineId", select: "medicineName medicineImage medicineType medicineExpireDate medicineDesc medicineStock medicineUnitPrice comments" },
      ]
    }

   
  ])
  if(!cart) return res.status(200).json({message:"not have cart",count:0,cart:[]})
  
  if(cart?.products.length)
  {
    console.log(cart.products.length);
    cart.products.map((ele)=>{
      totalPrice += (ele.medicineId.medicineUnitPrice * ele.quantity )
    })
   count = cart.products.length
    return res.status(200).json({message:"Done" ,count , totalPrice ,productList:cart.products})
  }
   return res.status(200).json({message:"Done", count:0,cart:[]})


}


export const  updateQuantity =async (req,res,next)=>{

  const { medicineId} = req.params;
  const { quantity} = req.body;
  let totalPrice =0
   const updateCart = await cartModel.findOneAndUpdate(
    { 'products.medicineId': medicineId },
    { $set: { 'products.$.quantity': quantity}} , {new:true}).populate([
      {
        path:"products",
        populate: [
          { path:"medicineId", select: "medicineName medicineImage medicineType medicineExpireDate medicineDesc medicineStock medicineUnitPrice comments" },
        ]
      }
  
     
    ])
    updateCart.products.map((ele)=>{
      totalPrice += (ele.medicineId.medicineUnitPrice * ele.quantity )
    })
    let count = updateCart.products.length
   return res.status(200).json({message:"Done",count , totalPrice,updateCart})
}




//add cart
export const addCart = async (req, res, next) => {
  const { medicineId, quantity } = req.body;
  const medicine = await medicineModel.findById(medicineId);
  if (!medicine || medicine.isDeleted) {
    return next(new Error("in-vaild medicine id", { cause: 400 }));
  }
  if (quantity > medicine.medicineStock) {
    await medicineModel.updateOne(
      { _id: medicineId },
      { $addToSet: { wishUsers: req.user._id } }
    );
    return next(
      new Error(
        `Medicine out of stock, only ${medicine.medicineStock} items left !`,
        { cause: 400 }
      )
    );
  }

  //check cart  if not cart we create cart and user have only one cart

  const cart = await cartModel.findOne({ createdBy: req.user._id });

  if (!cart) {
    const newCart = await cartModel.create({
      createdBy: req.user._id,
      products: [
        {
          medicineId,
          quantity,
        },
      ],
    });

    return res.status(201).json({ message: "Done", Cart: newCart });
  }

  let matchProduct = false;

  for (let i = 0; i < cart.products.length; i++) {
    if (cart.products[i].medicineId.toString() == medicineId) {
      cart.products[i].quantity = quantity;
      matchProduct = true;
      break;
    }
  }

  if (!matchProduct) {
    cart.products.push({ medicineId, quantity });
  }
  await cart.save();
  let count = cart.products.length
  return res.status(200).json({ message: "Done",count, Cart: cart });
};
//====================================================================================================================//

export async function clearAllCartItems(createdBy) {
  const cart = await cartModel.updateOne({ createdBy }, { products: [] });
  return cart;
}

//====================================================================================================================//
//clear all cart
export const clearAllCart = async (req, res, next) => {
  await clearAllCartItems(req.user._id);
  return res.status(200).json({ message: "Done" });
};

//====================================================================================================================//
//clear selected items
export async function deletedSelectItems(medicineIds, createdBy) {
  const cart = await cartModel.findOneAndUpdate(
    { createdBy },
    {
      $pull: {
        products: {
          medicineId: {
            $in: medicineIds,
          },
        },
      },
    }
  );
  return cart;
}
//====================================================================================================================//

export const deletedSelectItemsFromCart = async (req, res, next) => {
  const { medicineId } = req.body;
  await deletedSelectItems(medicineId, req.user._id);
  const cart = await cartModel.findOne({createdBy:req.user._id}).populate([
    {
      path:"products",
      populate: [
        { path:"medicineId", select: "medicineName medicineImage medicineType medicineExpireDate medicineDesc medicineStock medicineUnitPrice comments" },
      ]
    }

   
  ])

  return res.status(200).json({ message: "Done",Cart:cart });
};

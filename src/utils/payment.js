import Stripe from "stripe";

 async function payment({
    stripe= new Stripe(process.env.STRIPE_KEY),
    payment_method_types =['card'],
    mode= 'payment',
    customer_email ,
    line_items =[],
    metadata={},
    success_url= process.env.SUCCESS_URL,
    cancel_url= `${req.protocol}://${req.headers.host}/order/payment/cancel`,
    discounts=[],
}={}){
    const session= await stripe.checkout.sessions.create({
        // stripe,
        payment_method_types,
        mode ,
        customer_email,
        line_items,
        metadata,
        success_url,
        cancel_url,
        discounts

    })

    return session

 }
 export  default payment 
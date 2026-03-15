import Transaction from "../models/Transaction.js"  
import Stripe from "stripe"
import User from "../models/User.js"


const plans = [
     {
        _id: "basic",
        name: "Basic",
        price: 10,
        credits: 100,
        features: ['100 text generations', '50 image generations', 'Standard support', 'Access to basic models']
    },
    {
        _id: "pro",
        name: "Pro",
        price: 20,
        credits: 500,
        features: ['500 text generations', '200 image generations', 'Priority support', 'Access to pro models', 'Faster response time']
    },
    {
        _id: "premium",
        name: "Premium",
        price: 30,
        credits: 1000,
        features: ['1000 text generations', '500 image generations', '24/7 VIP support', 'Access to premium models', 'Dedicated account manager']
    }
]

// API Controller for getting all plans

export const getPlans = async (req,res)=>{
    try {
        res.json({success:true, plans})
    } catch (error)
    {
        res.json({success: false, message: error.message})
    }
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)    

const normalizeBaseUrl = (value) => (value || "").trim().replace(/\/+$/, "");

// API controller for purchasing a plan
export const purchasePlan = async (req, res) =>{
 try {
     const planId = req.body?.planId || req.query?.planId
     const userId = req.user ._id
     const plan = plans.find(p => p._id === planId)  

     if(!plan){
       return res.json({success: false, message: "Plan not found"})    
     }

       //    Create new transation
        const transaction = await Transaction. create({
             userId: userId,
             planId: plan ._id,
             amount: plan.price,
             credits: plan.credits,
             isPaid: false
        })
        // Create Stripe checkout session
        const forwardedProto = req.headers["x-forwarded-proto"]?.split(",")[0]
        const protocol = forwardedProto || req.protocol
        const hostBaseUrl = normalizeBaseUrl(`${protocol}://${req.get("host")}`)

        const clientBaseUrl =
            normalizeBaseUrl(process.env.CLIENT_URL) ||
            normalizeBaseUrl(req.headers.origin) ||
            hostBaseUrl

        if (!clientBaseUrl) {
            return res.json({ success: false, message: "CLIENT_URL is not configured" })
        }

        const session = await stripe.checkout.sessions.create({
            line_items:[
                {
                    price_data:{
                        currency: "usd",
                        unit_amount: plan.price * 100,
                        product_data: {
                            name: plan.name,
                        }
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url:`${clientBaseUrl}/loading?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:`${clientBaseUrl}/credits?checkout=cancelled`,
            metadata: {
                transactionId: transaction._id.toString(),
                appId: "quickgpt",
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Session expires in 30 minutes
        })
        res.json({success: true, url: session.url   
        })
      
    }catch(error) {
        res.json({success: false, message: error.message})


    }

}

export const verifyCheckoutSession = async (req, res) => {
    try {
        const sessionId = req.query?.session_id
        if (!sessionId) {
            return res.json({ success: false, message: "session_id is required" })
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId)
        const { transactionId, appId } = session?.metadata || {}

        if (appId !== "quickgpt" || !transactionId) {
            return res.json({ success: false, message: "Invalid session metadata" })
        }

        const transaction = await Transaction.findOne({ _id: transactionId })
        if (!transaction) {
            return res.json({ success: false, message: "Transaction not found" })
        }

        if (String(transaction.userId) !== String(req.user?._id)) {
            return res.status(403).json({ success: false, message: "Not allowed" })
        }

        if (!transaction.isPaid) {
            if (session.payment_status !== "paid") {
                return res.json({ success: false, message: "Payment not completed" })
            }

            await User.updateOne({ _id: transaction.userId }, { $inc: { credits: transaction.credits } })
            transaction.isPaid = true
            await transaction.save()
        }

        return res.json({ success: true })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}


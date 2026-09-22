import "./configs/env.js"

import express from "express"
import cors from "cors"
import connectDB from "./configs/db.js"
import userRouter from "./routes/userRoutes.js"
import chatRouter from "./routes/chatRoutes.js"
import messageRouter from "./routes/messageRoutes.js"
import creditRouter from "./routes/creditRoutes.js" 
import { stripeWebhooks } from "./controllers/webhooks.js"
import Stripe from "stripe"
import Transaction from "./models/Transaction.js"
import User from "./models/User.js"

const app = express()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Stripe Webhook Route
app.post("/api/stripe", express.raw({type: "application/json"}), stripeWebhooks)


// Middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        process.env.CLIENT_URL
    ].filter(Boolean),
    credentials: true
}))

app.use(express.json())

// Routes
app.get("/",(req,res)=>res.send("Server us Live!"))
app.use("/api/user",userRouter)
app.use("/api/chat",chatRouter)
app.use("/api/message",messageRouter)
app.use("/api/credit", creditRouter)

// Stripe success/cancel fallbacks (in case Checkout is configured to return to backend)
const clientBaseUrl = (process.env.CLIENT_URL || "").trim().replace(/\/+$/, "")

app.get("/payment-cancelled", (req, res) => {
    if (!clientBaseUrl) {
        return res.status(500).send("CLIENT_URL is not configured")
    }
    res.redirect(`${clientBaseUrl}/credits?checkout=cancelled`)
})

app.get("/loading", async (req, res) => {
    const sessionId = req.query?.session_id
    const checkout = req.query?.checkout || "success"

    if (sessionId) {
        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId)
            const { transactionId, appId } = session?.metadata || {}

            if (appId === "quickgpt" && transactionId && session.payment_status === "paid") {
                const transaction = await Transaction.findOne({ _id: transactionId })
                if (transaction && !transaction.isPaid) {
                    await User.updateOne({ _id: transaction.userId }, { $inc: { credits: transaction.credits } })
                    transaction.isPaid = true
                    await transaction.save()
                }
            }
        } catch (_error) {
            // ignore and let the frontend handle polling/verification
        }
    }

    const qs = new URLSearchParams()
    qs.set("checkout", String(checkout))
    if (sessionId) qs.set("session_id", String(sessionId))

    if (!clientBaseUrl) {
        return res.status(500).send("CLIENT_URL is not configured")
    }

    res.redirect(`${clientBaseUrl}/loading?${qs.toString()}`)
})
const PORT = process.env.PORT || 3000

const start = async () => {
    await connectDB()
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

start().catch((error) => {
    console.error("Failed to start server:", error?.message || error)
    process.exit(1)
})

import express from "express";
import { getPlans, purchasePlan, verifyCheckoutSession } from "../controllers/creditController.js";
import { protect } from "../middlewares/auth.js";


const creditRouter = express.Router()

creditRouter.get("/plan", getPlans)
creditRouter.get("/plans", getPlans)
creditRouter.get("/verify", protect, verifyCheckoutSession)
creditRouter.get("/purchase", protect, purchasePlan)
creditRouter.post("/purchase", protect, purchasePlan)

export default creditRouter


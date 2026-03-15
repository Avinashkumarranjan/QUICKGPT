import express from "express";
import { createChat, getChat, deleteChat } from "../controllers/chatController.js";
import { protect } from "../middlewares/auth.js";



const chatRouter = express.Router();

chatRouter.get("/create",protect, createChat)
chatRouter.get("/get",protect, getChat)
chatRouter.get("/get",protect, deleteChat)

export default chatRouter
import express from "express";
import { createChat, getChat, deleteChat } from "../controllers/chatController.js";
import { protect } from "../middlewares/auth.js";

const chatRouter = express.Router();

// 1. Change .get to .post for creating
chatRouter.post("/create", protect, createChat);

// 2. Keep this as .get to retrieve chats
chatRouter.get("/get", protect, getChat);

// 3. Change this to .delete (or a different path) so it doesn't conflict with /get
chatRouter.delete("/delete/:id", protect, deleteChat); 

export default chatRouter;
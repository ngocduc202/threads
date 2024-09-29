import express from 'express'
import protectRoute from '../middlewares/protectRoute.js'
import { getConversations, getMessages, sendMessage } from '../controllers/messageController.js'


const route = express.Router()

route.get("/conversations" , protectRoute ,getConversations)
route.get("/:otherUserId" , protectRoute ,getMessages)
route.post("/" , protectRoute ,sendMessage)


export default route
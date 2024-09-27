import express from 'express'
import protectRoute from '../middlewares/protectRoute.js'
import { getMessages, sendMessage } from '../controllers/messageController.js'


const route = express.Router()

route.post("/" , protectRoute ,sendMessage)
route.get("/:otherUserId" , protectRoute ,getMessages)


export default route
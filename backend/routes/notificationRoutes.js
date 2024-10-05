import express from 'express'
import protectRoute from '../middlewares/protectRoute.js'
import { getNotifications } from '../controllers/notificationController.js'


const route = express.Router()

route.get("/" , protectRoute , getNotifications)



export default route
import express from 'express'
import protectRoute from '../middlewares/protectRoute.js'
import { deleteNotification, deleteNotifications, getNotifications } from '../controllers/notificationController.js'


const route = express.Router()

route.get("/" , protectRoute , getNotifications)
route.delete("/" , protectRoute , deleteNotifications)
route.delete("/:id" , protectRoute , deleteNotification)


export default route
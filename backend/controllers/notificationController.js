import Notification from "../models/notificationModel.js"

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id

    const notifications = await Notification.find({to: userId}).populate({
    path: 'from',
    select: 'username profilePic'
  })
    await Notification.updateMany({to: userId}, {read: true})
    res.status(200).json(notifications)
  } catch (error) {
    console.log("Error in getNotifications ", error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
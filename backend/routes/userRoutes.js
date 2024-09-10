import express from "express"
import { followUnfollowUser, loginUser, logout, signupUser } from "../controllers/userController.js"
import protectRoute from "../middlewares/protectRoute.js"

const router = express.Router()

router.post("/signup", signupUser)
router.post("/login", loginUser)
router.post("/logout", logout)
router.post("/follow/:id", protectRoute , followUnfollowUser)

export default router
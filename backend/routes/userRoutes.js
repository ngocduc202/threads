import express from "express"
import { detailUsers, followUnfollowUser, freezeAccount, getSuggestedUsers, getUserProfile, loginUser, logout, signupUser, updateUser } from "../controllers/userController.js"
import protectRoute from "../middlewares/protectRoute.js"

const router = express.Router()

router.get("/profile/:query", getUserProfile)
router.get("/suggested" , protectRoute, getSuggestedUsers)
router.post("/signup", signupUser)
router.post("/login", loginUser)
router.post("/logout", logout)
router.post("/follow/:id", protectRoute , followUnfollowUser)
router.post("/details", protectRoute , detailUsers)
router.put("/update/:id", protectRoute , updateUser)
router.put("/freeze", protectRoute , freezeAccount)

export default router
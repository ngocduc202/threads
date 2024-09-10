import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js"

export const signupUser = async (req, res) => {
  try {
    const { name , email , username , password} = req.body
    const user = await User.findOne({$or: [{email}, {username}]})

    if(user) {
      return res.status(400).json({message: "User already exists"})
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword
    })

    await newUser.save()

    if(newUser){

      generateTokenAndSetCookie(newUser._id, res)
      res.status(200).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username
      })
    } else{
      res.status(400).json({message: "Invalid user data"})
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.log("Error in signupUser: ", error.message)
  }
}

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "")

    if(!user || !isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid username or password" })
    }

    generateTokenAndSetCookie(user._id, res)

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.log("Error in loginUser: ", error.message)
  }
}

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 1,
    })
    res.status(200).json({ message: "Logout successful" })
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.log("Error in logout: ", error.message)
  }
}

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params
    const userToModify = await User.findById(id)
    const currentUser = await User.findById(req.user._id)

    if(id === req.user._id) {
      return res.status(403).json({ message: "You can't follow/unfollow yourself" })
    }

    if(!userToModify || !currentUser) {
      return res.status(404).json({ message: "User not found" })
    }

    const isFollowing = currentUser.following.includes(id)

    if(isFollowing){
      //Unfollow
      await User.findByIdAndUpdate(req.user._id , {$pull: { following: id }})
      await User.findByIdAndUpdate(id , {$pull: { followers: req.user._id }})
      res.status(200).json({ message: "Unfollowed successfully" })
    }else{
      //Follow
      await User.findByIdAndUpdate(req.user._id , {$push: { following: id }})
      await User.findByIdAndUpdate(id , {$push: { followers: req.user._id }})
      res.status(200).json({ message: "Followed successfully" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.log("Error in followUnfollowUser: ", error.message)
  }
}
import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js"
import {v2 as cloudinary} from 'cloudinary'
import Post from "../models/postModel.js"
import Notification from "../models/notificationModel.js"
import mongoose from "mongoose"
import {faker} from "@faker-js/faker"
import { getRecipientSocketId, io } from "../socket/socket.js"


export const getUserProfile = async (req, res) => {
  const {query} = req.params
  try {
    let user
    if(mongoose.Types.ObjectId.isValid(query)){
      user = await User.findOne({_id: query}).select("-password").select("-updatedAt")
    }else{
      user = await User.findOne({username: query}).select("-password").select("-updatedAt")
    }
    if(!user) return res.status(400).json({error: "User not found"})
    res.status(200).json({user})
  } catch (error) {
    res.status(500).json({error: error.message})
    console.log("Error in getUserProfile: ", error.message)
  }
}

export const signupUser = async (req, res) => {
  try {
    const { name , email , username , password} = req.body
    if (!name || !email || !username || !password) {
      return res.status(400).json({error: "Please enter all fields"})
    }

    const user = await User.findOne({$or: [{email}, {username}]})
    if(user) {
      return res.status(400).json({error: "User already exists"})
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
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
        username: newUser.username,
        bio: newUser.bio,
        profilePic: newUser.profilePic
      })
    } else{
      res.status(400).json({error: "Invalid user data"})
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
    console.log("Error in signupUser: ", error.message)
  }
}

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "")

    if(!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" })
    }

    if(user.isFrozen) {
      user.isFrozen = false
      await user.save()
    }

    generateTokenAndSetCookie(user._id, res)

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
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
    res.status(500).json({ error: error.message })
    console.log("Error in logout: ", error.message)
  }
}

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params
    const userToModify = await User.findById(id)
    const currentUser = await User.findById(req.user._id)

    if(id === req.user._id.toString()) {
      return res.status(403).json({ error: "You can't follow/unfollow yourself" })
    }

    if(!userToModify || !currentUser) {
      return res.status(404).json({ error: "User not found" })
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
      const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: userToModify._id,
			});

			await newNotification.save();

      const recipientSocketId = getRecipientSocketId(userToModify?._id);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("newNotification", newNotification);
      }

      res.status(200).json({ message: "Followed successfully" })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
    console.log("Error in followUnfollowUser: ", error.message)
  }
}

export const updateUser = async (req, res) => {
	const { name, email, username, password, bio } = req.body;
	let { profilePic } = req.body;

	const userId = req.user._id;
	try {
		let user = await User.findById(userId);
		if (!user) return res.status(400).json({ error: "User not found" });

		if (req.params.id !== userId.toString())
			return res.status(400).json({ error: "You cannot update other user's profile" });

		if (password) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);
			user.password = hashedPassword;
		}

		if (profilePic) {
			if (user.profilePic) {
				await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profilePic);
			profilePic = uploadedResponse.secure_url;
		}

		user.name = name || user.name;
		user.email = email || user.email;
		user.username = username || user.username;
		user.profilePic = profilePic || user.profilePic;
		user.bio = bio || user.bio;

		user = await user.save();

		// Find all posts that this user replied and update username and userProfilePic fields
		await Post.updateMany(
			{ "replies.userId": userId },
			{
				$set: {
					"replies.$[reply].username": user.username,
					"replies.$[reply].userProfilePic": user.profilePic,
				},
			},
			{ arrayFilters: [{ "reply.userId": userId }] }
		);

		// password should be null in response
		user.password = null;

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in updateUser: ", err.message);
	}
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id

    const usersFollowedByYou = await User.findById(userId).select("following")

    const user = await User.aggregate([
      {
        $match: {
          _id:{$ne:userId},
        }
      },
      {
        $sample:{ size: 10 }
      }
    ])

    const filterUsers = user.filter(user => !usersFollowedByYou.following.includes(user._id))
    const suggestedUsers = filterUsers.slice(0, 4)

    suggestedUsers.forEach(user => user.password = null)

    res.status(200).json(suggestedUsers)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const freezeAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if(!user) {
      return res.status(404).json({ error: "User not found" })
    }

    user.isFrozen = true
    await user.save()

    res.status(200).json({success: true})
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const detailUsers = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No user IDs provided" });
    }

    const users = await User.find({ _id: { $in: ids } }).select('-password'); // Loại bỏ password khỏi kết quả

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export const searchUser = async (req, res) => {
  try {
    const {username , name} = req.query
    const searchCriteria = {};
    if (username) {
      searchCriteria.username = { $regex: username, $options: 'i' }; // Tìm kiếm không phân biệt hoa thường
    }
    if (name) {
      searchCriteria.name = { $regex: name, $options: 'i' };
    }
    const users = await User.find(searchCriteria).select('-password');
    res.status(200).json(users)
  } catch (error) {
    console.log("Error in searchUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
}

export const InsertUser = async (req, res) => {
  const num = 10
  const users = [];
  for (let i = 0; i < num; i++) {
    users.push({
      username: faker.internet.userName(),
      name: faker.person.fullName(),
      password: "123456",
      email: faker.internet.email(),
      profilePic: faker.image.url(),
      bio: faker.person.bio(),
      followers: [],
      following: [],
      isFrozen: false
    });
  }
  try {
    await User.insertMany(users);
    res.status(201).json({ message: 'Fake users created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error creating fake users', details: err });
  }
}
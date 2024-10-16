import User from "../models/userModel.js"
import Post from "../models/postModel.js"
import Notification from "../models/notificationModel.js"
import {v2 as cloudinary} from 'cloudinary'
import { getRecipientSocketId, io } from "../socket/socket.js"

export const createPost = async (req, res) => {
  try {
      const { postedBy, text } = req.body
      let { img } = req.body
    if(!postedBy || !text) {
      res.status(400).json({ error: "Please fill all the fields" })
    }

    const user = await User.findById(postedBy)
    if(!user) {
      res.status(404).json({ error: "User not found" })
    }

    if(user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to create post" })
    }

    const maxLength = 500
    if(text.length > maxLength) {
      return res.status(400).json({ error: `Text must be less than ${maxLength} characters` })
    }

    if(img){
      const uploadedResponse = await cloudinary.uploader.upload(img)
      img = uploadedResponse.secure_url
    }

    const newPost = new Post({
      postedBy,
      text,
      img
    })
    await newPost.save()

    res.status(200).json( newPost )
  } catch (error) {
    res.status(500).json({ error: error.message })
    console.log("Error in createPost: ", error.message)
  }
}

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if(!post){
      return res.status(404).json({ error: "Post not found" })
    }

    res.status(200).json(post)
  } catch (error) {
    res.status(500).json({ error: error.message })
    console.log("Error in getPost: ", error.message)
  }
}

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if(!post){
      return res.status(404).json({ error: "Post not found" })
    }
    if(post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to delete post" })
    }

    if(post.img){
      const imgId = post.img.split("/").pop().split(".")[0]
      await cloudinary.uploader.destroy(imgId)
    }

    await Post.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Post deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
    console.log("Error in deletePost: ", error.message)
  }
}

export const likeUnlikePost = async (req, res) => {
  try {
		const { id: postId } = req.params;
		const userId = req.user._id;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			res.status(200).json({ message: "Post unliked successfully" });
		} else {
			// Like post
			post.likes.push(userId);
			await post.save();

      const notification = new Notification({
				from: userId,
				to: post.postedBy,
				type: "like",
			});

      await notification.save();

      const recipientSocketId = getRecipientSocketId(post.postedBy);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("newNotification", notification);
      }
			res.status(200).json({ message: "Post liked successfully" });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

export const replyToPost = async (req, res) => {
  try {
    const {text} = req.body
    const {id: postId} = req.params
    const userId = req.user._id
    const userProfilePic = req.user.profilePic
    const username = req.user.username

    if(!text){
      return res.status(400).json({error: "Text is required"})
    }

    const post = await Post.findById(postId)
    if(!post){
      return res.status(404).json({error: "Post not found"})
    }

    const reply = {userId, userProfilePic, username, text}
    const notification = new Notification({
      from: userId,
      to: post.postedBy,
      type: "reply",
      postId: postId,
      text: reply.text,
    });

    await notification.save();
    post.replies.push(reply)

    const recipientSocketId = getRecipientSocketId(post.postedBy);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newNotification", notification);
    }

    await post.save()
    res.status(200).json(reply)
  } catch (error) {
    res.status(500).json({ error: error.message })
    console.log("Error in replyToPost: ", error.message)
  }
}

export const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId)

    if(!user){
      return res.status(404).json({error: "User not found"})
    }

    const following = user.following

    const feedPosts = await Post.find({postedBy: {$in:following}}).sort({createdAt: -1})

    res.status(200).json(feedPosts)
  } catch (error) {
    res.status(500).json({ error: error.message })
    console.log("Error in getFeedPosts: ", error.message)
  }
}

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find().sort({createdAt: -1})
    res.status(200).json(posts)
  } catch (error) {
    res.status(500).json({ error: error.message })
    console.log("Error in getAllPost: ", error.message)
  }
}


export const getUserPosts = async (req, res) => {
  const {username} = req.params
  try {
    const user = await User.findOne({username})
    if(!user){
      return res.status(404).json({error: "User not found"})
    }

    const posts = await Post.find({postedBy: user._id}).sort({createdAt: -1})
    res.status(200).json(posts)
  } catch (error) {
    res.status(500).json({ error: error.message })
    console.log("Error in getUserPosts: ", error.message)
  }
}
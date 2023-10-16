import express from 'express'
import authMiddleWare from '../middleware/AuthMiddleware.js'
const router = express.Router()
import PostModel from "../models/postModel.js";
import UserModel from "../models/userModel.js";
import mongoose from "mongoose";

//create post
router.post('/',async (req, res) => {
    const newPost = new PostModel(req.body);

    try {
      await newPost.save();
      res.status(200).json(newPost);
    } catch (error) {
      res.status(500).json(error);
    }
  })

//get a single post
router.get('/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      const post = await PostModel.findById(id);
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json(error);
    }
  })

//update a post
router.put('/:id', async (req, res) => {
    const postId = req.params.id;
    const { userId } = req.body;
  
    try {
      const post = await PostModel.findById(postId);
      if (post.userId === userId) {
        await post.updateOne({ $set: req.body });
        res.status(200).json("Post updated!");
      } else {
        res.status(403).json("Authentication failed");
      }
    } catch (error) {}
  })
//delete a post
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    const { userId } = req.body;
  
    try {
      const post = await PostModel.findById(id);
      if (post.userId === userId) {//same user is deleting the post
        await post.deleteOne();
        res.status(200).json("Post deleted.");
      } else {//if another user is deleting a post
        res.status(403).json("Action forbidden");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  })
//like a post
router.put('/:id/like', async (req, res) => {
    const id = req.params.id;
    const { userId } = req.body;
    try {
      const post = await PostModel.findById(id);
      if (post.likes.includes(userId)) {
        await post.updateOne({ $pull: { likes: userId } });
        res.status(200).json("Post disliked");
      } else {
        await post.updateOne({ $push: { likes: userId } });
        res.status(200).json("Post liked");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  })
//get all timeline post of user
router.get('/:id/timeline', async (req, res) => {
    const userId = req.params.id
    try {
      const currentUserPosts = await PostModel.find({ userId: userId });
  
      const followingPosts = await UserModel.aggregate([
        { 
          $match: {
            _id: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "posts",
            localField: "following",
            foreignField: "userId",
            as: "followingPosts",
          },
        },
        {
          $project: {
            followingPosts: 1,
            _id: 0,
          },
        },
      ]);
  
      res.status(200).json(
        currentUserPosts
          .concat(...followingPosts[0].followingPosts)
          .sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          })
      );
    } catch (error) {
      res.status(500).json(error);
    }
  })

export default router
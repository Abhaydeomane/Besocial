import express from 'express';
import UserModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router()

router.post('/register', async (req, res) => {

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPass
    const newUser = new UserModel(req.body);
    const {username} = req.body
    try {
      // check for any user exist
      const oldUser = await UserModel.findOne({ username });
  
      if (oldUser)
        return res.status(400).json({ message: "User already exists" });
  
      // if not
      const user = await newUser.save();
      const token = jwt.sign(//creating jwt token
        { username: user.username, id: user._id },//payload
        process.env.JWTKEY,//secrete key
        { expiresIn: "1h" }//time
      );
      res.status(200).json({ user, token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await UserModel.findOne({ username: username });
  
      if (user) {
        const validity = await bcrypt.compare(password, user.password);
  
        if (!validity) {
          res.status(400).json("wrong password");
        } else {
          const token = jwt.sign(
            { username: user.username, id: user._id },
            process.env.JWTKEY,
            { expiresIn: "1h" }
          );
          res.status(200).json({ user, token });
        }
      } else {
        res.status(404).json("User not found");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  })

export default router
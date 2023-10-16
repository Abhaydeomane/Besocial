import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const secret = process.env.JWTKEY;
const authMiddleWare = async (req, res, next) => {//this is used to check authentication i.e. jwt token
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log(token)
    if (token) {
      const decoded = jwt.verify(token, secret);
      console.log(decoded)
      req.body._id = decoded?.id;
    }
    next();//this is command to send data on server side;
  } catch (error) {
    console.log(error);
  }
};

export default authMiddleWare;

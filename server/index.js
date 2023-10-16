import express from "express";
import bodyParser from "body-parser";
import cors from "cors";//to give permission/access to website for communication
import dotenv from "dotenv";//to hide the password
import mongoose from "mongoose";


// routes
import AuthRoute from './routes/AuthRoute.js'
import UserRoute from './routes/UserRoute.js'
import PostRoute from './routes/PostRoute.js'
import UploadRoute from './routes/UploadRoute.js'

const app = express();


// middleware
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors({
  origin: '*'
}));

// to serve images inside public folder
app.use(express.static('public')); 
app.use('/images', express.static('images'));


dotenv.config();
const PORT = "5000";

const CONNECTION =process.env.MONGO_URL;
mongoose//mongodb connection
  .connect(CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to database"))
  .catch((error) => console.log(`${error} did not connect`));


app.use('/auth', AuthRoute)
app.use('/user', UserRoute)
app.use('/posts', PostRoute)
app.use('/upload', UploadRoute)

app.listen(PORT, () => 
console.log(`Listening at Port ${PORT}`))
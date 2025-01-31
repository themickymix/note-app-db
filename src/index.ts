import express, { Request, Response } from "express";
import mongoose from "mongoose";
const cors = require("cors");
import dotenv from "dotenv";
import User from "./models/user.model";
import jwt from "jsonwebtoken";
import noteRouter from "./routes/note.route";
const cookieParser = require("cookie-parser");
import * as argon2 from "argon2";
dotenv.config();
const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/* app.use(
  cors({
    origin: function (origin: any, callback: any) {
      const allowedOrigins = ["*", "*"];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "accepts",
      "Access-Control-Allow-Origin",
      "Credentials",
    ],
    credentials: true,
  })
); */
//test lang
//
app.use(
  cors({
    origin: ["https://noteapp-lake.vercel.app"], // Remove the trailing slash
    credentials: true, // Allow credentials to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "accepts",
      "Access-Control-Allow-Origin",
      "Credentials",
    ],
  })
);

app.options("*", cors()); // Handle preflight requests

// Routes
app.use("/api/v1", noteRouter);

const verifyToken = async (req: any, res: any, next: any) => {
  const token = req.cookies.jwt;
  if (!token) return res.sendStatus(401); // Unauthorized

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (err) {
    res.sendStatus(403); // Forbidden
  }
};

// Connect to MongoDB using environment variable
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 3001, () => {
      /*     console.log(
        `Server running on port http://localhost:${process.env.PORT || 3001}`
      ); */
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Register Route
app.post("/register", async (req: any, res: any) => {
  const { username, email, password } = req.body;
  try {
    const hash = await argon2.hash(password);
    const user = await User.create({
      username,
      email,
      password: hash,
    });
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // Set cookie and send response
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    return res.status(201).json({ message: "User created", token });
  } catch (err) {
    return res.status(500).json({ message: "An error occurred." });
  }
});

// Login Route

app.post("/login", async (req: any, res: any): Promise<any> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });
  console.log(user);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  try {
    if (await argon2.verify(user.password, password)) {
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email }, // Include user ID for better identification
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      // Set JWT cookie
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Ensure cookies are only sent over HTTPS in production
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      });

      // Respond with success message (avoid sending the token in the response body for security)
      res.status(200).json({ message: "Login successful" });
    } else {
      // Unauthorized
      res.status(401).json({ message: "Invalid credentials." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "An error occurred." });
  }
});
// Logout Route
app.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ message: "Logout successful." });
});

// Auth Status Route
app.get("/auth/status", verifyToken, (req: any, res: Response) => {
  res.status(200).json({ authenticated: true, user: req.user });
});

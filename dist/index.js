"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors = require("cors");
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = __importDefault(require("./models/user.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const note_route_1 = __importDefault(require("./routes/note.route"));
const cookieParser = require("cookie-parser");
const argon2 = __importStar(require("argon2"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(cookieParser());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
app.use(cors({
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
}));
app.options("*", cors()); // Handle preflight requests
// Routes
app.use("/api/v1", note_route_1.default);
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.jwt;
    if (!token)
        return res.sendStatus(401); // Unauthorized
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.sendStatus(403); // Forbidden
    }
});
// Connect to MongoDB using environment variable
mongoose_1.default
    .connect(process.env.MONGODB_URI)
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
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    try {
        const hash = yield argon2.hash(password);
        const user = yield user_model_1.default.create({
            username,
            email,
            password: hash,
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        // Set cookie and send response
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });
        return res.status(201).json({ message: "User created", token });
    }
    catch (err) {
        return res.status(500).json({ message: "An error occurred." });
    }
}));
// Login Route
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield user_model_1.default.findOne({ email: email });
    console.log(user);
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }
    try {
        if (yield argon2.verify(user.password, password)) {
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, // Include user ID for better identification
            process.env.JWT_SECRET, { expiresIn: "7d" });
            // Set JWT cookie
            res.cookie("jwt", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // Ensure cookies are only sent over HTTPS in production
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            });
            // Respond with success message (avoid sending the token in the response body for security)
            res.status(200).json({ message: "Login successful" });
        }
        else {
            // Unauthorized
            res.status(401).json({ message: "Invalid credentials." });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "An error occurred." });
    }
}));
// Logout Route
app.post("/logout", (req, res) => {
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(200).json({ message: "Logout successful." });
});
// Auth Status Route
app.get("/auth/status", verifyToken, (req, res) => {
    res.status(200).json({ authenticated: true, user: req.user });
});
//# sourceMappingURL=index.js.map
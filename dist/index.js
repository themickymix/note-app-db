"use strict";
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
const bcrypt = require("bcryptjs");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const note_route_1 = __importDefault(require("./routes/note.route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
//middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.options("*", cors()); // Handle preflight requests
//routes
app.use("/api/notes", note_route_1.default);
// Connect to MongoDB using environment variable
mongoose_1.default
    .connect(process.env.MONGODB_URI)
    .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 3001, () => {
        console.log(`Server running on port http://localhost:${process.env.PORT || 3001}`);
    });
})
    .catch((error) => {
    console.error("MongoDB connection error:", error);
});
// Auth routes with proper typing
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = yield bcrypt.hash(password, 10);
        const user = new user_model_1.default({ username, email, password: hashedPassword });
        yield user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.status(201).json({ token });
        localStorage.setItem("token", token);
    }
    catch (err) {
        res.status(500).json({ message: "Error creating user." });
    }
}));
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield user_model_1.default.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found." });
        const isPasswordValid = yield bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid)
            return res.status(401).json({ message: "Invalid credentials." });
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.status(200).json({ token });
    }
    catch (err) {
        res.status(500).json({ message: "Error logging in." });
    }
}));
//# sourceMappingURL=index.js.map
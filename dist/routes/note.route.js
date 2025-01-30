"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { getAllNotes, getNoteById, addNewNote, editNote, deleteNote, } = require("../controller/note.controller");
const { authenticateToken } = require("../middleware/auth");
const router = express_1.default.Router();
router.get("/", authenticateToken, getAllNotes);
router.get("/note/:id", authenticateToken, getNoteById);
router.post("/", authenticateToken, addNewNote);
router.patch("/:id", authenticateToken, editNote);
router.delete("/:id", authenticateToken, deleteNote);
exports.default = router;
//# sourceMappingURL=note.route.js.map
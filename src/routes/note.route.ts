import express from "express";
import { body } from "express-validator";
const {
  getAllNotes,
  getNoteById,
  addNewNote,
  editNote,
  deleteNote,
} = require("../controller/note.controller");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, getAllNotes);
router.get("/:id", authenticateToken, getNoteById);
router.post("/", authenticateToken, addNewNote);
router.put("/:id", authenticateToken, editNote);
router.delete("/:id", authenticateToken, deleteNote);

export default router;

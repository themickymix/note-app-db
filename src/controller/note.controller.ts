import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Note from "../models/note.model";

// Get all notes for the authenticated user
const getAllNotes = async (
  req: Request & { user: { _id: string } },
  res: Response
) => {
  try {
    const notes = await Note.find({ user: req.user._id });
    res.status(200).json(notes);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ message: "Error fetching notes.", error: message });
  }
};

// Get a note by ID
const getNoteById = async (
  req: Request & { user: { _id: string } },
  res: Response
) => {
  console.log(req.user); // Add this to verify user authentication
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json(note);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    res
      .status(500)
      .json({ message: "Error fetching the note.", error: message });
  }
};

// Add a new note
const addNewNote = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, content } = req.body as { title: string; content: string };
    const note = new Note({
      title,
      content,
      user: (req as Request & { user: { _id: string } }).user._id,
    });

    await note.save();
    res.status(201).json(note);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    res
      .status(500)
      .json({ message: "Error creating the note.", error: message });
  }
};

// Edit an existing note
const editNote = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { title, content } = req.body as { title?: string; content?: string };
    const note = await Note.findOneAndUpdate(
      { _id: id, user: (req as Request & { user: { _id: string } }).user._id },
      { title, content },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    res
      .status(500)
      .json({ message: "Error updating the note.", error: message });
  }
};

// Delete an existing note
const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const note = await Note.findOneAndDelete({
      _id: id,
      user: (req as Request & { user: { _id: string } }).user._id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    res
      .status(500)
      .json({ message: "Error deleting the note.", error: message });
  }
};

export { getAllNotes, getNoteById, addNewNote, editNote, deleteNote };

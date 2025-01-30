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
exports.deleteNote = exports.editNote = exports.addNewNote = exports.getNoteById = exports.getAllNotes = void 0;
const express_validator_1 = require("express-validator");
const note_model_1 = __importDefault(require("../models/note.model"));
// Get all notes for the authenticated user
const getAllNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notes = yield note_model_1.default.find({ user: req.user._id });
        res.status(200).json(notes);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ message: "Error fetching notes.", error: message });
    }
});
exports.getAllNotes = getAllNotes;
// Get a note by ID
const getNoteById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const note = yield note_model_1.default.findOne({ _id: req.params.id, user: req.user._id });
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.status(200).json(note);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        res
            .status(500)
            .json({ message: "Error fetching the note.", error: message });
    }
});
exports.getNoteById = getNoteById;
// Add a new note
const addNewNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { title, content } = req.body;
        const note = new note_model_1.default({
            title,
            content,
            user: req.user._id,
        });
        yield note.save();
        res.status(201).json(note);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        res
            .status(500)
            .json({ message: "Error creating the note.", error: message });
    }
});
exports.addNewNote = addNewNote;
// Edit an existing note
const editNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const note = yield note_model_1.default.findOneAndUpdate({ _id: id, user: req.user._id }, { title, content }, { new: true, runValidators: true });
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.status(200).json(note);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        res
            .status(500)
            .json({ message: "Error updating the note.", error: message });
    }
});
exports.editNote = editNote;
// Delete an existing note
const deleteNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const note = yield note_model_1.default.findOneAndDelete({
            _id: id,
            user: req.user._id
        });
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.status(200).json({ message: "Note deleted successfully" });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        res
            .status(500)
            .json({ message: "Error deleting the note.", error: message });
    }
});
exports.deleteNote = deleteNote;
//# sourceMappingURL=note.controller.js.map
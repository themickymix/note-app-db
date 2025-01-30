"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const NoteSchema = mongoose.Schema({
    title: {
        type: String,
        required: false,
    },
    content: {
        type: String,
        required: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true, // Correct spelling
});
const Note = mongoose.model("Note", NoteSchema);
exports.default = Note;
//# sourceMappingURL=note.model.js.map
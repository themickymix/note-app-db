const mongoose = require("mongoose");

const NoteSchema = mongoose.Schema(
  {
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
  },
  {
    timestamps: true, // Correct spelling
  }
);

const Note = mongoose.model("Note", NoteSchema);

export default Note;

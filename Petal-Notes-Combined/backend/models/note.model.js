const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true }
);

const noteModel = mongoose.model("note", noteSchema);

module.exports = { noteModel };
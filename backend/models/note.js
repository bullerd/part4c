//part4 version - no connection to database; that's in app.js
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  content: { type: String, minLength: 5, required: true },
  important: { type: Boolean, required: false },
});

noteSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Note", noteSchema);

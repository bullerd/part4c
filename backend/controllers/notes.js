const notesRouter = require("express").Router();
const Note = require("../models/note");
const User = require("../models/user");
const logger = require("../utils/logger");

notesRouter.get("/", async (request, response, next) => {
  logger.info("handling /api/notes");
  try {
    const notes = await Note.find({});
    response.json(notes);
  } catch (error) {
    next(error);
  }
});

notesRouter.get("/:id", async (request, response, next) => {
  const id = request.params.id;
  try {
    const note = await Note.findById(id);
    if (!note) {
      return response.status(404).end();
    }
    response.json(note);
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

notesRouter.delete("/:id", async (request, response, next) => {
  const id = request.params.id;
  try {
    const result = await Note.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

notesRouter.put("/:id", async (request, response, next) => {
  const { content, important } = request.body;
  try {
    const note = await Note.findById(request.params.id);
    if (!note) {
      return response.status(404).end();
    }
    note.content = content;
    note.important = important ?? note.important;

    const updatedNote = await note.save();
    response.json(updatedNote);
  } catch (error) {
    next(error);
  }
});

// add a note and it's user to the database
notesRouter.post("/", async (request, response, next) => {
  logger.info("adding a note");

  const body = request.body;

  const user = await User.findById(body.userId);

  if (!user) {
    return response.status(400).json({ error: "userId missing or invalid" });
  }

  if (!body.content) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const note = new Note({
    content: body.content,
    important: body.important ?? false,
    user: user._id,
  });

  try {
    const savedNote = await note.save();
    user.notes = user.notes.concat(savedNote._id);
    await user.save();
    response.status(201).json(savedNote);
  } catch (error) {
    next(error);
  }
});

module.exports = notesRouter;

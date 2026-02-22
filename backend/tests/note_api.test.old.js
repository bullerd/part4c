const { test, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const logger = require("../utils/logger");
const app = require("../app");
const helper = require("./test_helper");
const Note = require("../models/note");
const { isModuleNamespaceObject } = require("node:util/types");

const api = supertest(app);

//From FSO
// beforeEach(async () => {
//   await Note.deleteMany({});
//   initialNotes.forEach(async (n) => {
//     const newNote = Note(n);
//     await newNote.save();
//   });
// });

//From Claude and me:
beforeEach(async () => {
  await Note.deleteMany({});
  await Note.insertMany(helper.initialNotes);
});

test("notes are returned as json", async () => {
  await api
    .get("/api/notes")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all notes are returned", async () => {
  const response = await api.get("/api/notes");
  // logger.info(response.body);

  assert.strictEqual(response.body.length, helper.initialNotes.length);
});

test("a specific note is returned", async () => {
  const notesAtStart = await helper.notesInDb();
  const noteToView = notesAtStart[0];

  const response = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  assert.deepStrictEqual(noteToView, response.body);
  // could have simplified this the above to:
  // assert(contents.includes("Buller's MongoDB lesson 12/14/25"));
});

test("a valid note can be added ", async () => {
  const newNote = {
    content: "async/await makes this much easier",
    important: true,
  };
  await api
    .post("/api/notes")
    .send(newNote)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const notesAtEnd = await helper.notesInDb();
  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1);

  const contents = notesAtEnd.map((r) => r.content);
  assert(contents.includes("async/await makes this much easier"));
});

test("note without content is not added", async () => {
  const newNote = {
    important: true,
  };

  await api.post("/api/notes").send(newNote).expect(400);

  const notesAtEnd = await helper.notesInDb();
  // console.log(response.body.map((n) => n.content));

  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length);
});

test("a note can be deleted", async () => {
  const notesAtStart = await helper.notesInDb();
  const noteToDelete = notesAtStart[0];

  await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);
  const notesAtEnd = await helper.notesInDb();
  const ids = notesAtEnd.map((n) => n.id);
  assert(!ids.includes(noteToDelete.id));

  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1);
});

after(async () => {
  await mongoose.connection.close();
});

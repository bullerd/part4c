// this code is copied from FSO
const assert = require("node:assert");
const { test, after, beforeEach, describe } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Note = require("../models/note");
// const usersRouter = require("../controllers/users");
const api = supertest(app);

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await Note.deleteMany({});
    await Note.insertMany(helper.initialNotes);

    await User.deleteMany({});

    const passwordHashes = await Promise.all(
      helper.initialUsers.map((u) => bcrypt.hash(u.password, 10)),
    );
    const users = helper.initialUsers.map(({ password, ...rest }, i) => ({
      ...rest,
      passwordHash: passwordHashes[i],
    }));

    await User.insertMany(users);
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "bullerd",
      name: "David Buller",
      password: "testpwd",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: helper.initialUsers[0].username,
      name: "Superuser",
      password: "testpwd",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert(result.body.error.includes("expected `username` to be unique"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  // test that adding 2 notes to the same user works properly
  test("succeeds with valid data", async () => {
    const usersAtStart = await helper.usersInDb();
    const initialUser = usersAtStart[0];

    const newNote = {
      content: "async/await simplifies making async calls",
      important: true,
      userId: initialUser.id,
    };

    const returnedNote = await api
      .post("/api/notes")
      .send(newNote)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    // we need to test that we concatenated this note to the list of notes associated with this user
    // and the userid is associated with the note

    const notesAtEnd = await helper.notesInDb();
    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1);

    const contents = notesAtEnd.map((n) => n.content);
    assert(contents.includes("async/await simplifies making async calls"));
    assert.strictEqual(returnedNote.body.user, initialUser.id);

    const user = usersAtEnd.find((u) => u.id === initialUser.id);
    //let's convert id Objects to strings for comparison
    assert(
      user.notes.map((id) => id.toString()).includes(returnedNote.body.id),
    );
  });
});

after(async () => {
  await mongoose.connection.close();
});

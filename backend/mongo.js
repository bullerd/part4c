const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}
// console.log(process.argv);

const password = encodeURI(process.argv[2]);
const url = `mongodb+srv://db_for_fso:${password}@cluster0.3tpfwj2.mongodb.net/testNoteApp?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.set("strictQuery", false);

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
});

const Note = mongoose.model("Note", noteSchema);

// note.save().then((result) => {
//   console.log("note saved!");
// });
const runAppend = async () => {
  var note = new Note({
    content: "Buller's MongoDB lesson 12/14/25",
    important: true,
  });
  await note.save();

  note = new Note({
    content: "A second MongoDB record has been added",
    important: true,
  });
  await note.save();
};

const runQuery = async () => {
  //   /is/i is a regex expression - match "is" case insensitive
  const result = await Note.find({ content: /is/i });
  result.forEach((note) => {
    console.log(note);
  });
};

const main = async () => {
  await mongoose.connect(url);
  try {
    await runAppend();
    // await runQuery();
  } finally {
    await mongoose.connection.close();
  }
};

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

import Note from "./components/Note.jsx";
import { useState, useEffect } from "react";
import noteService from "./services/notes";
import Footer from "./components/Footer.jsx";

const Notification = ({ message, type }) => {
  console.log("notification: ", type);
  if (message === null) {
    return null;
  }
  const className =
    type === "success" ? "notification success" : "notification error";

  return <div className={className}>{message}</div>;
};

const App = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const hook = () => {
    console.log("effect");
    noteService.getAll().then((initialNotes) => {
      console.log("promise fulfilled");
      setNotes(initialNotes);
    });
  };

  useEffect(hook, []);

  const showNotification = (message, type = "success", ms = 4000) => {
    if (type === "success") {
      setSuccessMessage(message);
      setTimeout(() => {
        setSuccessMessage(null);
      }, ms);
    } else {
      setErrorMessage(message);
      setTimeout(() => {
        setErrorMessage(null);
      }, ms);
    }
  };

  const handleDeleteNote = async (note) => {
    // persist the change,
    // then rebuild our note list from the old list
    // but without this note (by id)
    try {
      await noteService.deleteById(note.id);
    } catch (error) {
      alert(`the note '${note.content}' was already deleted from the server`);
    } finally {
      // always remove it from local UI
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
    }
  };

  const addNote = async (event) => {
    event.preventDefault();
    console.log("button clicked", event.target);
    if (!newNote.trim()) return;
    const newNoteObject = {
      //id: notes.length + 1,
      content: newNote,
      important: Math.random() > 0.5,
    };

    // setNotes(notes.concat(newNoteObject));
    // setNewNote("");
    try {
      const returnedNote = await noteService.create(newNoteObject);
      console.log(returnedNote);
      setNotes(notes.concat(returnedNote));
      setNewNote("");
      showNotification("success!", "success");
    } catch (err) {
      const details = err.response?.data?.details;
      let message = "";
      if (details) {
        message = Object.values(details).join(" ");
      }
      showNotification(
        `Invalid data.  Please ensure you are entering a valid number of characters (${message})`,
        "error",
        10000
      );
    }
  };

  const handleNoteChange = (event) => {
    console.log(event.target.value);
    setNewNote(event.target.value);
  };

  const handleToggleImportance = (id) => {
    console.log(`need to toggle importance of id ${id}`);
    const note = notes.find((n) => n.id === id);
    const changedNote = { ...note, important: !note.important };

    // persist the change,
    // then rebuild our notes list from the old list
    // but use the newly modified note.
    noteService
      .update(id, changedNote)
      .then((updatedNote) => {
        setNotes(notes.map((note) => (note.id === id ? updatedNote : note)));
      })
      .catch((error) => {
        setErrorMessage(
          `the note '${note.content}' was already deleted from the server`
        );
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
        setNotes(notes.filter((n) => n.id !== id));
      });
  };

  const notesToShow = showAll ? notes : notes.filter((note) => note.important);

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={successMessage} type="success" />
      <Notification message={errorMessage} type="error" />
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? "important" : "all"}
        </button>
      </div>
      <ul>
        {notesToShow.map((item) => (
          <Note
            key={item.id}
            note={item}
            toggleImportance={() => handleToggleImportance(item.id)}
            deleteNote={() => handleDeleteNote(item)}
          />
        ))}
      </ul>
      <form id="newNote" onSubmit={addNote}>
        <input value={newNote} onChange={handleNoteChange} />
        <button type="submit" disabled={!newNote.trim()}>
          save
        </button>
      </form>
      <Footer />
    </div>
  );
};

export default App;

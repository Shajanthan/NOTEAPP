require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

//MongoDB connection
mongoose.connect(config.connectionString);

const User = require("./models/userModel");
const Note = require("./models/noteModel");

const express = require("express");
const cors = require("cors");

const jwt = require("jsonwebtoken");
const { authenticationToken } = require("./utilities");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

//create new user
app.post("/create-user", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name) {
    return res.status(400).json({ error: true, message: "Name is required" });
  }
  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  const isUser = await User.findOne({ email: email });

  if (isUser) {
    return res.json({ error: true, message: "User already exist" });
  }

  const user = new User({ name, email, password });

  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m",
  });

  return res.json({
    error: false,
    user,
    accessToken,
    message: "User added successfully",
  });
});

//login user
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }
  const userInfo = await User.findOne({ email: email });

  if (!userInfo) {
    return res.status(400).json({ error: true, message: "No user found" });
  }

  if (userInfo.email == email && userInfo.password == password) {
    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m",
    });
    return res.json({
      error: false,
      message: "Login successfull",
      email,
      accessToken,
    });
  } else {
    return res
      .status(400)
      .json({ error: true, message: "Invalid credentials" });
  }
});

//get user
app.get("/get-user", authenticationToken, async (req, res) => {
  const { user } = req.user;

  const isUser = await User.findOne({ _id: user._id });
  if (!user) {
    return res.sendStatus(401);
  }
  return res.json({
    user: { name: isUser.name, email: isUser.email, _id: isUser._id },
    message: "User data fetched successfully",
  });
});

//add note
app.post("/add-note", authenticationToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }
  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }
  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });
    await note.save();

    return res.json({ error: false, note, message: "Note added successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

//edit note
app.put("/edit-note/:noteId", authenticationToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags) {
    return res
      .status(400)
      .json({ error: true, message: "No changes provided" });
  }
  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }
    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

//get all notes
app.get("/get-all-notes", authenticationToken, async (req, res) => {
  const { user } = req.user;
  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });

    return res.json({
      error: false,
      notes,
      message: "All notes retrieved successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

//delete note
app.delete("/delete-note/:noteId", authenticationToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }
    await Note.deleteOne({ _id: noteId, userId: user._id });
    return res.json({ error: false, message: "Note deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: false, message: "Internal server error" });
  }
});

//update pinned
app.put(
  "/update-note-pinned/:noteId",
  authenticationToken,
  async (req, res) => {
    const noteId = req.params.noteId;
    const { user } = req.user;
    const { isPinned } = req.body;

    try {
      const note = await Note.findOne({ _id: noteId, userId: user._id });
      if (!note) {
        return res.status(404).json("Note not found");
      }

      note.isPinned = isPinned;

      await note.save();

      return res.json({
        error: false,
        note,
        message: "pinned update successfully",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: true, message: "Internal server error" });
    }
  }
);

//search note
app.get("/search-note/", authenticationToken, async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json({ error: true, message: "Search Query is required" });
  }

  try {
    const machingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });

    return res.json({
      error: false,
      notes: machingNotes,
      message: "Notes matching for the search query retrieved successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

app.listen(8000);

module.exports = app;

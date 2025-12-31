const express = require("express");
const cors = require("cors");
require("./db"); // connect MongoDB

const Article = require("./models/Article");

const app = express();
app.use(cors());
app.use(express.json());

// TEST API
app.get("/", (req, res) => {
  res.send("API is running");
});

// GET all articles
app.get("/articles", async (req, res) => {
  const articles = await Article.find();
  res.json(articles);
});

// GET single article
app.get("/articles/:id", async (req, res) => {
  const article = await Article.findById(req.params.id);
  res.json(article);
});

// UPDATE article
app.put("/articles/:id", async (req, res) => {
  const updated = await Article.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

// DELETE article
app.delete("/articles/:id", async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  res.json({ message: "Article deleted" });
});

// START SERVER
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

const express = require("express");
const bodyParser = require("body-parser");

const { bot_1, bot_2, bot_3, bot_4, bot_5 } = require("./bots");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let output;

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/manual_post", (req, res) => {
  res.render("form", {
    action: "post",
    link: "/manual_post",
  });
});

app.get("/manual_confirm", (req, res) => {
  res.render("form", {
    action: "confirm",
    link: "/manual_confirm",
  });
});

app.post("/manual_post", async (req, res) => {
  output = await bot_4(req.body);
  res.render("status", { output });
});

app.post("/manual_confirm", async (req, res) => {
  output = await bot_5(req.body);
  res.render("status", { output });
});

app.get("/fdaHGhznbd", async (req, res) => {
  output = await bot_1();
  res.render("status", { output });
});

app.get("/jdvJKNsksd", async (req, res) => {
  output = await bot_2();
  res.render("status", { output });
});

app.get("/confirm", async (req, res) => {
  output = await bot_3();
  res.render("status", { output });
});

const port = process.env.PORT || "5000";
app.listen(port, () => console.log("Server started succesfully"));

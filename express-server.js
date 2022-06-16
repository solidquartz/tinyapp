const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());


////////databases//////////

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

////////////////////////

//helper function to generate shortURL
const generateRandomString = (length = 6) => Math.random().toString(20).substr(2, length);


////////endpoints////////

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//set username with cookies
app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//
app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL };
  res.render("urls_show", templateVars);
});

//create shortURL
app.post("/urls", (req, res) => {
  console.log(req.body); //refers to the form body
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//go to longURL from shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
});

//post new longURL to shortURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body["name"];
  urlDatabase[shortURL] = longURL;
  console.log("shortURL is: ", shortURL, " longURL is: ", longURL, " urlDatabase is: ", urlDatabase, " req body is: ", req.body["name"]);
  res.redirect(`/urls/${shortURL}`);
});

//login - create cookie
app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie("username", username);
  res.redirect(`/urls/`);
});

//logout - clear cookie
app.post("/logout", (req, res) => {
  const { username } = req.body;
  res.clearCookie("username", username);
  res.redirect(`/urls/`);
});

//register account
app.get("/register/", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("register", templateVars);
});

//registration handler
app.post("/register/", (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  users[userId] = { id: userId, email: email, password: password };
  console.log("userID is: ", userId, users);
  res.cookie("user_id", userId);
  res.redirect("/urls");
});



////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


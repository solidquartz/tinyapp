const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

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
    password: "asdf"
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

//helper function to link email with userId
const getIdFromEmail = (email) => {
  for (let userId in users) {
    if (email === users[userId].email) {
      return users[userId];
    }
  } return null;
};

//look up email
const lookUpEmail = (email) => {
  for (let userId in users) {
    if (email === users[userId].email) {
      return users[userId].email;
    }
  }
  return null;
};

//////////////////////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//index page
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = { user: users[userId], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//create URL page
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = { user: users[userId], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

//URL show page (where edit is)
app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const userId = req.cookies["user_id"];
  const templateVars = { user: users[userId], urls: urlDatabase, shortURL: req.params.shortURL, longURL };
  res.render("urls_show", templateVars);
});

//create shortURL
app.post("/urls", (req, res) => {
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
  res.redirect(`/urls/${shortURL}`);
});


////////////////LOG IN/OUT ////////////////

//login endpoint
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getIdFromEmail(email);

  if (email !== lookUpEmail(email)) {
    return res.status(403).send("That email has not been registered to an account (403)");
  }

  if (user.password === password) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    return res.status(403).send("Email and password do not match (403)");
  }
});

//log out
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//login page
app.get("/login", (req, res) => {
  const templateVars = { user: req.cookies["user_id"] || null };
  res.render("login", templateVars);
});

////////////////REGISTRATION////////////////

//register account
app.get("/register", (req, res) => {
  const templateVars = { user: null, urls: urlDatabase };
  res.render("register", templateVars);
});

//registration handler
app.post("/register/", (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (email === "" || password === "") {
    return res.status(400).send("Please enter an email and a password (400)");

    //checks if the email is already registered
  } else if (email === lookUpEmail(email)) {
    return res.status(400).send("Email address has already been registered to an account (400)");

  } else {
    users[userId] = { id: userId, email: email, password: password };
    console.log(users);
    res.cookie("user_id", userId);
    res.redirect("/urls");
  }
});


//////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


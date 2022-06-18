////////////REQUIREMENTS////////////
const express = require("express");
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");

const { urlsForUser, checkLogIn, lookUpEmail, getIdFromEmail, generateRandomString } = require('./helpers');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['bubble', 'tea', 'lilac'],
}));


////////////////////////////////////////
//////////////databases////////////////
/////////////////////////////////////


const urlDatabase = {
  sgq3y6: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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

////////////////////////////////////////
//////////////endpoints////////////////
/////////////////////////////////////

//landing page
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//URLS page
app.get("/urls", (req, res) => {
  const userId = checkLogIn(req, res, users);
  const urls = urlsForUser(userId, urlDatabase);

  const templateVars = { user: users[userId], urls };
  res.render("urls_index", templateVars);
});

//CREATE URL page
app.get("/urls/new", (req, res) => {
  const userId = checkLogIn(req, res, users);
  const urls = urlsForUser(userId, urlDatabase);

  const templateVars = { user: users[userId], urls };

  if (urls) {
    res.render("urls_new", templateVars);

  } else {
    res.send("Permission denied. Please log in or register.");
  }
});

//URL Show page (Edit)
app.get("/urls/:shortURL", (req, res) => {
  const userId = checkLogIn(req, res, users);
  
  const shortURL = req.params.shortURL;
  const longURL = req.params.longURL;

  const templateVars = { user: users[userId], urlDatabase, shortURL, longURL };
  res.render("urls_show", templateVars);
});

//create shortURL
app.post("/urls", (req, res) => {
  const userId = checkLogIn(req, res, users);
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  //add to db object
  urlDatabase[shortURL] = { "longURL": longURL, "userID": userId };
  console.log(urlDatabase);

  res.redirect(`/urls/${shortURL}`);
});

//go to longURL from shortURL
app.get("/u/:shortURL", (req, res) => {

  for (const shortURL in urlDatabase) {
    if (shortURL === req.params.shortURL) {
      const longURL = urlDatabase[req.params.shortURL].longURL;
      res.redirect(longURL);
    }
  }
  res.send("Error! URL doesn't exist.");
});

//DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = checkLogIn(req, res, users);
  const owned = urlsForUser(userId, urlDatabase);
  const shortURL = req.params.shortURL;
  if (!userId || !urlDatabase[shortURL] || !owned) {
    res.send("You do not have permission to delete that URL.");
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls/');
});

//EDIT shortURL
app.post("/urls/:shortURL", (req, res) => {
  const userId = checkLogIn(req, res, users);
  const owned = urlsForUser(userId, urlDatabase);
  const shortURL = req.params.shortURL;
  const longURL = req.body["name"];
  if (!userId || !urlDatabase[shortURL] || !owned) {
    res.send("You do not have permission to edit that URL.");
  }
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls/${shortURL}`);
});


////////////////LOG IN/OUT ////////////////

//login endpoint
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = getIdFromEmail(email, users);
  const hashedPassword = users[userID].password;

  if (email !== lookUpEmail(email, users)) {
    return res.status(403).send("That email has not been registered to an account (403)");
  }
  if (bcrypt.compareSync(password, hashedPassword)) {

    req.session.user_id = userID;
    res.redirect("/urls");

  } else {
    return res.status(403).send("Email and password do not match (403)");
  }
});

//log out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//login page
app.get("/login", (req, res) => {
  const userId = users[req.session.user_id];
  const templateVars = { user: userId || null };
  if (userId) {
    res.redirect("/urls");
  }
  res.render("login", templateVars);
});

////////////////REGISTRATION////////////////

//register page
app.get("/register", (req, res) => {
  const userId = req.session.user_id;

  if (userId) {
    res.redirect("/urls");
  }
  const templateVars = { user: null, urls: urlDatabase };
  res.render("register", templateVars);
});

//registration handler
app.post("/register/", (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  if (email === "" || password === "") {
    return res.status(400).send("Please enter an email and a password (400)");

    //checks if the email is already registered
  } else if (email === lookUpEmail(email, users)) {
    return res.status(400).send("Email address has already been registered to an account (400)");

  } else {
    users[userId] = { id: userId, email: email, password: hashedPassword };
    console.log("login: ", users);
    req.session.user_id = userId;
    res.redirect("/urls");
  }
});


//////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
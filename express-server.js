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

//check if user is logged in
const checkLogIn = (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    res.send("Please log in or register.");
  } else {
    for (const user in users) {
      if (user === userId) {
        return userId;
      }
    }
    res.clearCookie("user_id");
    res.redirect("/login");
  }
};


//check if user has permission to view
//was used in get/urls
// const checkPermission = (req, res) => {
//   const userId = req.cookies["user_id"];
//   if (!userId) {
//     res.send("Please log in or register.");
//   } else {
//     for (const user in users) {
//       if (user === userId) {
//         return userId;
//       }
//     }
//   }
// };

//returns the URLS linked to user, in new object
const urlsForUser = (id, urlDatabase) => {
  let userURLs = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  } return userURLs;
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

//URLS page
app.get("/urls", (req, res) => {
  const userId = checkLogIn(req, res);
  const urls = urlsForUser(userId, urlDatabase);

  const templateVars = { user: users[userId], urls };

  console.log("urls are: ", urls);
  res.render("urls_index", templateVars);
});

//CREATE URL page
app.get("/urls/new", (req, res) => {
  const userId = checkLogIn(req, res);
  const urls = urlsForUser(userId, urlDatabase);

  const templateVars = { user: users[userId], urls };
  if (urls) {
    res.render("urls_new", templateVars);
  } else {
    res.send("Permission denied. Please log in or register.");
  }
});

//URL show page (where edit is)
app.get("/urls/:shortURL", (req, res) => {
  const userId = checkLogIn(req, res);

  const shortURL = req.params.shortURL;
  const longURL = req.params.longURL;
  const templateVars = { user: users[userId], urlDatabase, shortURL, longURL };
  res.render("urls_show", templateVars);
});

//create shortURL
app.post("/urls", (req, res) => {
  const userId = checkLogIn(req, res);
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
  const userId = checkLogIn(req, res);
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
  const userId = checkLogIn(req, res);
  const owned = urlsForUser(userId, urlDatabase);
  const shortURL = req.params.shortURL;
  const longURL = req.body["name"];
  if (!userId || !urlDatabase[shortURL] || !owned) {
    res.send("You do not have permission to editthat URL.");
  }
  urlDatabase[shortURL].longURL = longURL;
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
  const userId = req.cookies["user_id"];
  const templateVars = { user: req.cookies["user_id"] || null };
  if (userId) {
    res.redirect("/urls");
  }
  res.render("login", templateVars);
});

////////////////REGISTRATION////////////////

//register page
app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];

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
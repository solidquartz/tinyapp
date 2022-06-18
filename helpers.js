//generate shortURL
const generateRandomString = (length = 6) => Math.random().toString(20).substr(2, length);

//use email to get userID number. use to log in.
const getIdFromEmail = (email, users) => {
  for (let userId in users) {

    if (email === users[userId].email) {
      return userId;
    }
  } return null;
};

//look up email. use to  check if an account exists
const lookUpEmail = (email, users) => {

  for (let userId in users) {

    if (email === users[userId].email) {

      return users[userId].email;
    }
  }
  return null;
};

//check if user is logged in to set permissions and redirects
const checkLogIn = (req, res, users) => {
  const userId = req.session.user_id;

  if (!userId) {
    res.send("Please log in or register.");

  } else {
    for (const user in users) {

      if (user === userId) {
        return userId;
      }
    }
    res.redirect("/login");
  }
};

//returns the URLS linked to user, in a new object
const urlsForUser = (id, urlDatabase) => {
  let userURLs = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

//////////////////
module.exports = { urlsForUser, checkLogIn, lookUpEmail, getIdFromEmail, generateRandomString };
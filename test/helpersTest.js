const { assert } = require('chai');

const { urlsForUser, checkLogIn, lookUpEmail, getIdFromEmail, generateRandomString } = require('../helpers');

const testUsers = {
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

const testDatabase = {
  sgq3y6: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

//////////////////////////////////////////
/////////////////////////////////////////

describe('generateRandomString', function() {
  it('should return a string with a length of 6', function() {
    const stringLength = generateRandomString().length;
    const expectedStringLength = 6;
    assert.strictEqual(stringLength, expectedStringLength, "The string was 6 characters long");
  });
});

describe('getIdFromEmail', function() {
  it('should return a user ID with valid email', function() {
    const userId = getIdFromEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(userId, expectedUserID, "The user IDs was found");
  });
});
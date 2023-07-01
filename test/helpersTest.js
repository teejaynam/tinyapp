const { assert } = require('chai');

const { checkEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user,expectedUserID);
  });


  it('should return undefined with email that doesnt exist', function() {
    const user = checkEmail("user@2.com", testUsers)
    assert.equal(user,undefined);
  });

  
  it('should return undefined with an empty argument', function() {
    const user = checkEmail(" ", testUsers)
    assert.equal(user,undefined);
  });
  
});
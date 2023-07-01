//function to check email in user db
const checkEmail = function(email, database) {
  for (let userId in database) {
    if (database[userId].email === email) {
      return userId;
    }
  }
  return false;
}

//6 character alphanumeric random string generator for shortened urls
const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  
  return randomString;
}

//function that returns object of urls made by a specific user
const urlsForUser = function(id, database) {
  const matchingURLs = {};
  for (let urlID in database) {

    const url = database[urlID];

    if (url.userId === id) {

      const urlDB = {
        [urlID] : {
          longURL : url.longURL,
          userId : url.userId
        }
      };

      Object.assign(matchingURLs, urlDB);
    }
  }
  return matchingURLs;
}

module.exports = { checkEmail, generateRandomString, urlsForUser };
const express = require("express");
const cookieParser = require("cookie-parser");
const e = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }),cookieParser());

//our alphanumeric random string generator for shortened urls
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  
  return randomString;
}

//check email in user db
function checkEmail(email) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  }
  return false;
}

//check pw in user db
function checkPassword(password) {
  for (let userId in users) {
    if (users[userId].password === password) {
      return true;
    }
  }
  return false;
}

//the database for our urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//the database for usernames
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//root page
app.get("/", (req,res) => {
  res.send("Hello!");
});

//urls db page
app.get("/urls", (req,res) => {
  if (users[req.cookies.user_id]) {
    const templateVars = { urls: urlDatabase, email : users[req.cookies.user_id].email };
    res.render('urls_index', templateVars);
  } else {
    const templateVars = { urls: urlDatabase, email : " "};
    res.render('urls_index', templateVars);
  }
});

//post req to urls appends to our url db with a new shortened url
app.post("/urls", (req, res) => {
  let id = generateRandomString();
  let postUrl = req.body.longURL;

  //update database
  urlDatabase[id] = postUrl;

  //add redirect to use new id
  res.redirect(`/urls/${id}`);
});

//post req to update urls but keep the id
app.post("/urls/:id", (req,res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

//post req to delete urls from db
app.post("/urls/:id/delete", (req,res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//get to login screen
app.get("/login", (req,res) => {
  if (users[req.cookies.user_id]) {
    const templateVars = { email : users[req.cookies.user_id].email };
    res.render("login", templateVars);
  } else {
    const templateVars = { email : " "};
    res.render("login", templateVars);
  }
});

//post req to /login creates a cookie
app.post("/login", (req,res) => {
  res.send("OK")
  res.redirect("/urls")
  /*
  if (checkEmail(req.body.email) && checkPassword(req.body.password)) {
    templateVars = { email : users[loggedInUserId].email }
    res.redirect("/urls", templateVars);
  } else {
    res.send("Incorrect email or password");
  }
  */
});

//post req to /logout and clear cookie
app.post("/logout", (req,res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

//page to do post request
app.get("/urls/new", (req, res) => {
  if (users[req.cookies.user_id]) {
    const templateVars = { email : users[req.cookies.user_id].email };
    res.render("urls_new", templateVars);
  } else {
    const templateVars = { email : " "};
    res.render("urls_new", templateVars);
  }
});

//page to show long url version of shortened url with path /urls/:id
app.get("/urls/:id", (req, res) => {
  if (users[req.cookies.user_id]) {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], email : users[req.cookies.user_id].email };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], email : " "};
    res.render("urls_show", templateVars);
  }
});

//redirect to the long url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (users[req.cookies.user_id]) {
    const templateVars = { email : users[req.cookies.user_id].email };
    res.render(`${longURL}`, templateVars);
  } else {
    const templateVars = { email : " "};
    res.render(`${longURL}`, templateVars);
  }
});

//page to show registration page
app.get("/register", (req,res) => {
    res.render("register");
});

//post handler to append to our users db
app.post("/register", (req,res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userId = generateRandomString();

  if (email === "" || password === "") {
    res.status(400);
    res.send("Empty email or password");
  }

  if (checkEmail(email)) {
    res.status(400);
    res.send("Email already exists");
  }

  const newUser = {
    id : userId,
    email : email,
    password : password
  };

  users[newUser.id] = newUser;
  res.cookie('user_id', userId);


  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


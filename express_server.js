const express = require("express");
const cookieParser = require("cookie-parser");
const bcrpyt = require("bcryptjs");
const e = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }),cookieParser());

//the database for our urls
const urlDatabase = {
  "b2xVn2" : {
    longURL: "http://www.lighthouselabs.ca",
    userId: "user2RandomID",
  },
  "9sm5xK" : {
    longURL: "http://www.google.com",
    userId: "userRandomID",
  },
  "111111" : {
    longURL: "http://www.youtube.com",
    userId: "user2RandomID",
  },
};

//the database for users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "funk",
  },
};

//6 character alphanumeric random string generator for shortened urls
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  
  return randomString;
}

//function to check email in user db
function checkEmail(email) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return userId;
    }
  }
  return false;
}

//function that returns object of urls made by a specific user
function urlsForUser(id) {
  const matchingURLs = {};
  for (let urlID in urlDatabase) {

    const url = urlDatabase[urlID];

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

//root page, redirect to urls
app.get("/", (req,res) => {
  if (users[req.cookies.user_id]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//urls db page
app.get("/urls", (req,res) => {
  const loggedOnUser = req.cookies.user_id;

  if (users[loggedOnUser]) {
    const urlsToShow = urlsForUser(loggedOnUser);
    const templateVars = { urls: urlsToShow, email : users[req.cookies.user_id].email };
    res.render('urls_index', templateVars);
  } else {
    res.status(401).send("You must login to view URLs -> /login");
  }
});

//post req to urls appends to our url db with a new shortened url
app.post("/urls", (req, res) => {
  const loggedOnUser = req.cookies.user_id;

  if (loggedOnUser) {
    let id = generateRandomString();
    let postUrl = req.body.longURL;
  
    //update database
    const newURL = {
      longURL : postUrl,
      userId : loggedOnUser,
    };

    urlDatabase[id] = newURL;
  
    //add redirect to use new id
    res.redirect(`/urls/${id}`);
  } else {
    res.status(401).send("You must login to shorten URLs");
  }
});

//post req to update urls but keep the id
app.post("/urls/:id", (req,res) => {
  const id = req.params.id;
  const newURL = req.body.longURL;

  if (!users[req.cookies.user_id]) {
    res.status(401).send("401 You must log in to update URLs");
  } else if (users[req.cookies.user_id].id !== urlDatabase[id].userId) {
    res.status(403).send("403 Forbidden to UPDATE someone else's URL");
  } else {
    if (newURL) {
      urlDatabase[req.params.id].longURL = req.body.longURL;
      res.redirect("/urls");
    } else {
      res.status(400).send("bad request");
    }
  }
});

//post req to delete urls from db
app.post("/urls/:id/delete", (req,res) => {
  const id = req.params.id;
  const deleteURL = urlDatabase[id] ? true : false;
  
  if (!users[req.cookies.user_id]) {
    res.status(401).send("401 You must log in to delete");
  } else if (users[req.cookies.user_id].id !== urlDatabase[id].userId) {
    res.status(403).send("403 Forbidden to delete someone else's URL");
  } else {
    if (deleteURL) {
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
    } else {
      res.status(404).send("website not found");
    }
  }

});

//page to do post request
app.get("/urls/new", (req, res) => {
  if (users[req.cookies.user_id]) {
    const templateVars = { email : users[req.cookies.user_id].email };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//page to show long url version of shortened url with path /urls/:id
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id] ? urlDatabase[id].longURL : undefined;

  if (!url) {
    res.status(404).send("404 Not Found");
  } else if (!users[req.cookies.user_id]) {
    res.status(401).send("401 You must log in");
  } else if (users[req.cookies.user_id].id !== urlDatabase[id].userId) {
    res.status(403).send("403 Forbidden to edit someone else's URL");
  } else {
    const templateVars = { id: req.params.id, longURL: url, email: users[req.cookies.user_id].email };
    res.render("urls_show", templateVars);
  }
});


//redirect to the long url
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id].longURL;
  if (url) {
    res.redirect(url);
  } else {
    res.status(404).send("404 - not a shortened url");
  }
});

//get to login screen
app.get("/login", (req,res) => {
  if (users[req.cookies.user_id]) {
    res.redirect("/urls");
  } else {
    const templateVars = { email : ""};
    res.render("login", templateVars);
  }
});

//post req to /login creates a cookie
app.post("/login", (req,res) => {
  res.clearCookie('user_id');
  const {email, password} = req.body;
  const user = checkEmail(email);

  if (user === false) {
    res.status(403).send("Email not found");
  }
  
  const checkPassword = bcrpyt.compareSync(password, users[user].password);

  if (checkPassword) {
    res.cookie('user_id',users[user].id);
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid credentials");
  }

});

//post req to /logout and clear cookie
app.post("/logout", (req,res) => {
  res.clearCookie('user_id');
  res.redirect("login");
});

//REGISTRATION, page to show registration page
app.get("/register", (req,res) => {
  if (users[req.cookies.user_id]) {
    res.redirect("/urls");
  } else {
    const templateVars = { email : ""};
    res.render("register", templateVars);
  }
});

//REGISTRATION, post handler to append to our users db
app.post("/register", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrpyt.hashSync(password, 10);
  const userId = generateRandomString();

  if (email === "" || password === "") {
    res.status(400);
    res.send("Empty email or password");
  } else if (checkEmail(email)) {   //if checkEmail is truthy, then email exists, and we return error code
    res.status(400);
    res.send("Email already exists");
  } else {
    const newUser = {
      id : userId,
      email : email,
      password : hashedPassword
    };
  
    users[newUser.id] = newUser;
  
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


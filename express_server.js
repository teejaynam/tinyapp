const express = require("express");
const cookieParser = require("cookie-parser");
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

//the database for our urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//root page 
app.get("/", (req,res) => {
  res.send("Hello!");
});

//urls db page
app.get("/urls", (req,res) => {
  //const { username } = req.body;
  //res.cookie("username", username);
  const templateVars = { urls: urlDatabase, username : req.cookies["username"] };
  res.render('urls_index', templateVars );
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

//post req to /login creates a cookie
app.post("/login", (req,res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
})

//page to do post request
app.get("/urls/new", (req, res) => {
  const templateVars = {  username : req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//page to show long url version of shortened url with path /urls/:id
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  const templateVars = {  username : req.cookies["username"] };
  res.redirect(`${longURL}`, templateVars)
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


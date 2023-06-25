const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

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
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const templateVars = { urls: urlDatabase };

//root page 
app.get("/", (req,res) => {
  res.send("Hello!");
});

//urls db page
app.get("/urls", (req,res) => {
  //const templateVars = { urls: urlDatabase };
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

//page to do post request
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//page to show long url version of shortened url with path /urls/:id
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(`${longURL}`)
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


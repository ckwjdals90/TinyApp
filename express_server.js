"use strict"

const express = require("express");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.set('trust proxy', 1) // trust first proxy
app.use(cookieSession({
  name: 'session',
  keys: ['secretkey1', 'secretkey2']
}))
app.use((req, res, next) => {
  res.locals.useremail = users[req.session.userSessId] ? req.session.useremail : null;
  res.locals.urls = urlDatabase;
  next();
});

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": { creator: 'asdf@asdf.asdf', longURL: "http://www.lighthouselabs.ca"},
  "9sm5xK": { creator: 'asdf@asdf.asdf', longURL: "http://www.google.com"},
};
var users = {
  '27wuxa':
   { email: 'asdf@asdf.asdf',
     password: '$2a$10$RPL/qnx9TWSry0bxUbv84O6TG1H8FpWyOeYrQehwl7aOcYLZW7Fta' }
  };

app.get("/", (req, res) => {
  res.render("homepage");
});

// //login and logout
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const emailInput = req.body.useremail;
  const passwordInput = req.body.password;

  var emailFound = "";
  var passwordFound = "";
  var userUniqId = "";
  Object.keys(users).forEach((userId) => {
    if (users[userId].email === emailInput) {
      emailFound = users[userId].email;
      passwordFound = users[userId].password;
      userUniqId = userId;
    }
  });

  if (emailInput === emailFound) {
    console.log("email found in the db");
    bcrypt.compare(passwordInput, passwordFound, (err, passwordMatch) => {
      if (passwordMatch) {
        req.session.userSessId = userUniqId;
        req.session.useremail = req.body.useremail
        res.redirect("/urls");
        return;
      } else {
        console.log("wrong password");
        res.status(401).send("Invalid email or password");
        return;
      }
    });
  } else {
    console.log("email not found");
    res.status(401).send("Invalid email or password");
    return;
  }
});

app.post("/logout", (req, res) => {
  req.session.useremail = undefined;
  req.session.userSessId = undefined;
  res.redirect("/");
});

// registration
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  var unavailableEmail = "";
  Object.keys(users).forEach((userId) => {
    if (users[userId].email === req.body.email) {
      console.log(users[userId].email);
      unavailableEmail = users[userId].email;
    }
  });

  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Please enter your email and password!");
  } else if (unavailableEmail === req.body.email){
    res.status(400).send("email unavailable");
  } else {
    let enteredEmail = req.body.email;
    let enteredPassword = req.body.password;
    let uniqueID = generateRandomString()
    bcrypt.hash(enteredPassword, saltRounds, (err, hash) => {
      const newUser = { email: enteredEmail, password: hash };
      console.log(hash);
      console.log(newUser);
      users[uniqueID] = newUser;
      console.log(users);
    });
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  res.render("urls_index");
});

app.post("/urls", (req, res) => {
  let useremail = req.session.useremail
  let ranNum = generateRandomString()
  let newLongURL = req.body.longURL.includes('http://' || 'https://') ? req.body.longURL : ("https://" + req.body.longURL)
  urlDatabase[ranNum] = { creator: useremail, longURL: newLongURL };
  console.log(urlDatabase);
  console.log("TADAAAA!/nnew URL has been created :D");
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { paramId: req.params.id }
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let newLongURL = req.body.longURL.includes('http://' || 'https://') ? req.body.longURL : ("https://" + req.body.longURL);
  urlDatabase[req.params.id].longURL = newLongURL;
  res.redirect("/urls");
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.floor(1 + Math.random() * Number.MAX_VALUE).toString(36).substring(1, 7);
}

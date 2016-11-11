"use strict"

const express = require("express");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

app.set('trust proxy', 1) // trust first proxy
app.use(cookieSession({
  name: 'session',
  keys: ['secretkey1', 'secretkey2']
}))

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
var users = {};

app.get("/", (req, res) => {

  res.end("Hello!");
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
  Object.keys(users).forEach((userId) => {
    if (users[userId].email === emailInput) {
      emailFound = users[userId].email;
      passwordFound = users[userId].password;
    }
  });

  if (emailInput === emailFound) {
    console.log("email found in the db");
    // var passwordMatch;
    bcrypt.compare(passwordInput, passwordFound, (err, passwordMatch) => {
      if (passwordMatch) {
      console.log("password matches, good to go");
      req.session.useremail = req.body.useremail;
      res.redirect("/urls");
      return;
    } else {
      console.log("wrong password");
      // res.send("Invalid email or password");
      res.status(403).send("Invalid email or password");
      return;
    }
  });
  } else {
    console.log("email not found");
    res.status(403).send("Invalid email or password");
    return;
  }
});

app.post("/logout", (req, res) => {
  req.session.useremail = undefined;
  res.redirect("/urls");
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
    // users[uniqueID] = { email: enteredEmail, password: hashPassword };

    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  let templateVars = { useremail: req.session.useremail, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    let templateVars = { useremail: req.session.useremail, urls: urlDatabase };
  res.render("urls_new", templateVars);
});

// // Browse through all of the short urls in database
// app.get("/urls", (req, res) => {
//   let urls = urlDatabase;
//   if (req.query.search) {
//     urls = urls.filter((url) => {
//       return url.
//     })
//   }
// })




app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  // let
  let ranNum = generateRandomString()
  urlDatabase[ranNum] = req.body.longURL;

  console.log("TADAAAA!/nnew URL has been created :D");
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function generateRandomString() {
return Math.floor(1 + Math.random() * Number.MAX_VALUE).toString(36).substring(1, 7);
}



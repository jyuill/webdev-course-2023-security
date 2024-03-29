// Demonstration of app with authentication incl cookies & sessions
// - builds on previous demos in app-auth-demo.js
// - including:
// 1. password in database (mongoose)
// 2. password in database with basic encryption
// 3. password in database with hashing 
// 4. password in database with hashing + salting

require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "Our Test Secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// set up mongodb connection with new database
mongoose.connect("mongodb://localhost:27017/userDB");
// mongodb schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
// manage session, salt and hash pwds etc
userSchema.plugin(passportLocalMongoose);

// new mongodb model (collection) using schema defined above
const User = new mongoose.model("User", userSchema);

// settings to get user info, set cookie, read cookie (?)
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// home pg route
app.get("/", function(req, res) {
    res.render("home");
});

// register pg route
app.get("/register", function(req, res) {
    res.render("register");
});

// secrets pg route - direct if authenticated frm prev session
app.get("/secrets", function(req, res) {
    console.log("try secrets");
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

// new registration
app.post("/register", function(req, res) {
    /* code from course - no longer works
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });   
        }
    });
    */
   // from Chat GPT - similar to below
   // works but NOT with latest mongoose pkg
   // as of March 2023
   // use npm install mongoose@6.10.0
   // if later mongoose installed, first do:
   // npm uninstall mongoose
   User.register({username: req.body.username}, req.body.password)
        .then(() => {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        })
        .catch(err => {
            res.redirect("/register");
        });
});

// login pg route
app.get("/login", function(req, res) {
    res.render("login");
});
// login confirm
// works as shown in course
app.post("/login", function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

      req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
      });
});

app.get("/logout", function(req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect("/");
    });
});


// confirming server
app.listen(3000, function() {
    console.log("server rolling on port 3000.");
});

//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

// set up mongodb connection with new database
mongoose.connect("mongodb://localhost:27017/userDB");
// mongodb schema
// couple options - more thorough
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
/* simpler - if you're into the brevity thing
const userSchema = {
    email: String,
    password: String
}
*/
// new mongodb model (collection) using schema defined above
const User = new mongoose.model("User", userSchema);

// home pg route
app.get("/", function(req, res) {
    res.render("home");
});

// register pg route
app.get("/register", function(req, res) {
    res.render("register");
});

// new registration
app.post("/register", function(req, res) {
    // collect inputs from form
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    // save to database and show secrets pg
    /* as shown in course - now throws error
    newUser.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.render("secrets");
        }
    }); */
    // alt suggested by chatGPT
    newUser.save()
        .then(() => {
            // Handle successful save
            res.render("secrets");
        })
        .catch((error) => {
            // Handle save error
            console.log(err);
        });

      
});

// login pg route
app.get("/login", function(req, res) {
    res.render("login");
});
// login confirm
app.post("/login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    /* shown in course - no longer works
    User.findOne({email: username}, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets");
                }
            }
        }
    });
    */
   // recommended by ChatGPT
   User.findOne({ email: username })
    .then((foundUser) => {
        // Handle successful query
        if (foundUser) {
            if (foundUser.password === password) {
                res.render("secrets");
            }
        }
      })
      .catch((error) => {
        // Handle query error
        console.log(error);
      });
   
});

// confirming server
app.listen(3000, function() {
    console.log("server rolling on port 3000.");
});

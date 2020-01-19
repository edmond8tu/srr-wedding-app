const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

var nodemailer = require('nodemailer');

const guestRoutes = express.Router();
//const userRoutes = express.Router();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let GuestSchema = require("./guest.model");
let UserSchema = require("./user.model");


const guestsConn = mongoose.createConnection("mongodb://localhost:27017/guests", { useNewUrlParser: true });
const Guest = guestsConn.model("Guest", GuestSchema);

const usersConn = mongoose.createConnection("mongodb://localhost:27017/users", { useNewUrlParser: true });
const User = usersConn.model("User", UserSchema);

//mongoose.connect("mongodb://localhost:27017/guests", { useNewUrlParser: true });
//const connection = mongoose.connection;

//console.log(guestsConn);

guestsConn.once("open", function() {
    console.log("MongoDB database connection established successfully");
});

app.use("/guests", guestRoutes);

guestRoutes.route("/add").post(function(req, res) {
    let guest = new Guest(req.body);
    guest.save()
        .then(guest => {
            res.status(200).json({"guest": "guest added successfully"});
        })
        .catch(err => {
            res.status(400).send("adding new guest failed");
        })
});

guestRoutes.route("/getGuests").get(function(req, res) {
    //console.log(req.query.nameEmail);
    //console.log("HEREEE");

    let query = {$or:[
        {guest_name: new RegExp(req.query.nameEmail)},
        {guest_email: new RegExp(req.query.nameEmail)}
    ]};

    Guest.find(query, function(err, guests) {
        console.log("INSIDE");
        if (err) {
            console.log(err);
        } else {
            console.log(guests);
            console.log("HIIII");
            res.json(guests);
        }
    })
});

guestRoutes.route("/confirmDeclineGuest").post(function(req, res) {
  let query = {guest_email: req.query.guest_email}

  let guest = new Guest(req.body);

  Guest.updateOne(query, guest, function(err, res) {
    if (err) {
      console.log(err);
    }
  });
}); 


/*  PASSPORT SETUP  */

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
});

/* PASSPORT LOCAL AUTHENTICATION */

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
    },

  function(username, password, done) {

        console.log(username, password);

      User.findOne({
        email: username
      }, function(err, user) {
        if (err) {
            
          return done(err);
        }

        if (!user) {
            console.log("ERR HERE");
          return done(null, false);
        }

        if (user.password != password) {
          return done(null, false);
        }

        console.log("ITS CORRECT");
        return done(null, user);
      });
  }
));

app.post('/loginRequest',
  passport.authenticate('local'),
  function(req, res) {
    res.status(200).json({"login": "logged in succesfully!", "user": req.user});
});

app.get("/checkLoggedIn", function(req, res) {
    console.log("RIGHT BEFORE");
    console.log(req.isAuthenticated());
    if (req.user) {
        res.status(200).json({"authenticated": true});
    } else{
        res.status(401).json({"authenticated": false});
    }
});

/*
app.get("/sendEmail", function(req, res) {
  console.log("HI");
  console.log(req.query.guestEmail);

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'edmond88tu@gmail.com',
      pass: 'Edmond88tu'
    }
  });
  
  var mailOptions = {
    from: 'edmond88tu@gmail.com',
    to: req.query.guestEmail,
    subject: 'RSVP for Emily and Justin',
    text: 'That was easy!'
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

});

*/

app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});

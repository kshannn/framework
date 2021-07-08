const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

// add requires for flash messages
const session = require('express-session');
const flash = require('connect-flash');

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts"); // put ./ in front in nodejs so that it doesn't search in node_modules folder (nodejs thing)

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);

// import routes - try to import routes only after express finished setting up
const landingRoutes = require('./routes/landing')
const postersRoutes = require('./routes/posters');
const usersRoutes = require('./routes/users');
// const cloudinaryRoutes = require('./routes/cloudinary/js');


// set up sessions
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

// set up flash messages
app.use(flash());

// register flash middleware
app.use(function(req,res,next){
  // res.locals refers to an object which keys are available in HBS files
  res.locals.success_messages = req.flash('success_messages');
  res.locals.error_messages = req.flash('error_messages');
  next();
})




async function main() {
    app.use('/',landingRoutes)
    app.use('/posters',postersRoutes)
    app.use('/users',usersRoutes)
    // app.use('/cloudinary', cloudinaryRoutes);
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});
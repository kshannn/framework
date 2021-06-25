const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

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

async function main() {
    app.use('/',landingRoutes)
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});
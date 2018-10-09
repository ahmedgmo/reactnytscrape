var express = require("express");
var exhbs = require("express-handlebars");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var morgan = require("morgan");
require("dotenv").config();

var db = require("./models");

mongoose.Promise = Promise;

var app = express();
var router = express.Router();

app.engine("handlebars", exhbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(express.static("public"));

app.use(router);
require("./routes/newsScrape.js")(router, db);

if (process.env.MONGODB_URI) {
    
    mongoose.connect(process.env.MONGODB_URI);
  } else {
    mongoose.connect("mongodb://localhost/Scrape-News-MongoDB", { useNewUrlParser: true });
  }

app.listen(process.env.PORT, () => {
    console.log(`App is Listening on Port:`);
});
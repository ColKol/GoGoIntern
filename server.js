require ('dotenv').config();

//Importing libraries and files needed
const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');
const bodyParser = require("body-parser");
const indexRoute = require(".//routes/index")
const userRoute = require("./routes/user")
const mongoose = require('mongoose')
const userInfo = require('./models/userCreation')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

require('./config/authentication')(passport);

//Setup session
app.use(session({
  secret: "secret",
  resave: true,
  saveUninitialized: true
}));

//Passport middleware
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());

//Setup stuff (basically defining some stuff regarding what files we are rendering)
app.set('view engine', 'ejs');
app.set('views', './views')
app.use(express.urlencoded({ extended: false }))

//Linking CSS and JS scripts
app.use(express.static(path.join(__dirname, 'public')));

//Database Conenction Stuff
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DATABASE_ACCESS_URL;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


//Routes (Basically all the possible filepaths for the website, will add more as the website gets larger)
app.use('', indexRoute);
app.use('/users', userRoute);

//Setting up a local enviroment
app.listen(3000) 
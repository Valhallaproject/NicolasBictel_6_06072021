require('dotenv').config();

const express = require('express');    //import express: node.js web framework
const bodyParser = require('body-parser');    //import body-parser: parse incoming request bodies in a middleware
const mongoose = require('mongoose');    //import mongoose
const path = require('path');    //import path: provides a way of working with directories and file paths.
const helmet = require('helmet');    //import Helmet, protection against sql and xss injection
const mongoSanitize = require('express-mongo-sanitize');    //middleware which sanitizes user-supplied data to prevent MongoDB Operator Injection

// import the routes for user and sauces from directory "routes"
const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

//connection to the data base mongoose
mongoose.connect(process.env.DB_URI,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))    //if the connection is successful
    .catch(() => console.log('Connexion à MongoDB échouée !'));const app = express();    //if connection failed

//manage cors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

app.use(helmet());
// To remove data, use:
app.use(mongoSanitize());

// Or, to replace prohibited characters with _, use:
app.use(
  mongoSanitize({
    replaceWith: '_',
  }),
);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// routes api
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;
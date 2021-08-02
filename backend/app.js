require('dotenv').config();

const express = require('express');    //import express: node.js web framework
const bodyParser = require('body-parser');    //import body-parser: parse incoming request bodies in a middleware
const mongoose = require('mongoose');    //import mongoose
const path = require('path');    //import path: provides a way of working with directories and file paths.

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

// routes api
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;
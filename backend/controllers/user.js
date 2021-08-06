const User = require('../models/User');
const bcrypt = require('bcrypt');    //Plugin for hashing the password
const jwt = require('jsonwebtoken');     //Plugin for token creation
const sanitize = require("mongo-sanitize");    //plugin to disinfect entrances against injection attacks
const cryptojs = require('crypto-js');    //plugin to hide email from database

//creation of a user account
exports.signup = (req, res, next) => {
    const email = sanitize(req.body.email);
    const cryptedEmail = cryptojs.HmacSHA256(email, process.env.EMAIL_ENCRYPTION_KEY).toString();
    const password = sanitize(req.body.password);
    bcrypt.hash(password, 10)    //we hash the password
    .then(hash => {
      const user = new User({
        email: cryptedEmail,    //email backup
        password: hash    //we assign the hash obtained as the value of the password property
      });
      user.save()    //we save the data in the database
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
//login to a user account
exports.login = (req, res, next) => {
  const email = sanitize(req.body.email);
  const cryptedEmail = cryptojs.HmacSHA256(email, process.env.EMAIL_ENCRYPTION_KEY).toString();
  const password = sanitize(req.body.password);
  User.findOne({ email: cryptedEmail })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              process.env.TOKEN,
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
const User = require('../models/User');
const bcrypt = require('bcrypt');    //Plugin for hashing the password
const jwt = require('jsonwebtoken');     //Plugin for token creation
const sanitize = require("mongo-sanitize");

//creation of a user account
exports.signup = (req, res, next) => {
    const email = sanitize(req.body.email);
    const password = sanitize(req.body.password);
    bcrypt.hash(password, 10)    //we hash the password
    .then(hash => {
      const user = new User({
        email: email,    //email backup
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
  const password = sanitize(req.body.password);
  User.findOne({ email: email })
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
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
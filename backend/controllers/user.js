const User = require('../models/User');
const bcrypt = require('bcrypt');    //Plugin for hashing the password
const jwt = require('jsonwebtoken');     //Plugin for token creation
const sanitize = require("mongo-sanitize");    //plugin to disinfect entrances against injection attacks
const cryptojs = require('crypto-js');    //plugin to hide email from database
const passwordValidator = require('password-validator');    //plugin to valid password

const schemaPassword = new passwordValidator();
schemaPassword
.is().min(8)    //Minimum length: 8 characters                                    
.is().max(20)    //Maximum length: 20 characters                                 
.has().uppercase()    //Must have at least one capital letter                              
.has().lowercase()    //Must have at least one lowercase                              
.has().digits()    //Must have at least one number
.has().not().spaces();    //Must not have spaces

//creation of a user account
exports.signup = (req, res, next) => {
  const email = sanitize(req.body.email);
  const cryptedEmail = cryptojs.HmacSHA256(email, process.env.EMAIL_ENCRYPTION_KEY).toString();
  const password = sanitize(req.body.password);
  if(schemaPassword.validate(password)) {
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
  } else {
    throw 'Le mot de passe doit contenir entre 8 et 20 caractères dont au moins une lettre majuscule, une lettre minusucle, et un chiffre';
  }
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
const jwt = require('jsonwebtoken');
require('dotenv').config()
//authentification
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];    //we separate the bearer and we only keep the token
    const decodedToken = jwt.verify(token, process.env.TOKEN);    //we check that the token corresponds to the secret token
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};
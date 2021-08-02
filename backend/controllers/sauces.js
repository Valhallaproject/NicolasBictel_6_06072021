const Sauce = require('../models/Sauce');
const fs = require('fs');    //Retrieval of the 'file system' module to manage downloads and modifications of images here

//Add one sauce
exports.addOneSauce = (req, res, next ) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ error }));
};

//Access all sauces
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ error }));
};

//Access one sauce
exports.getOneSauce = (req, res,next)=> {
    Sauce.findOne({
      _id: req.params.id
    })
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ error }));
};

//Modify sauce
exports.modifySauce = (req, res, next) => {
  let sauceObject = {};
  req.file ? (    //If the modification contains an image
    Sauce.findOne({
      _id: req.params.id
    }).then((sauce) => {    //We delete the old image from the server
      const filename = sauce.imageUrl.split('/images/')[1]
      fs.unlinkSync(`images/${filename}`)
    }),
    sauceObject = {    //We modify the data and add the new image
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename
      }`,
    }
  ) : (    //If the modification does not contain a new image
    sauceObject = {
      ...req.body
    }
  )
  Sauce.updateOne(    //We apply the parameters of sauceObject
    {
      _id: req.params.id
    }, {
      ...sauceObject,
      _id: req.params.id
    }
  )
  .then(() => res.status(200).json({
    message: 'Sauce modifiée !'
  }))
  .catch((error) => res.status(400).json({
    error
  }))
}

//Delete one sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({    //We recover the parameters of the sauce
      _id: req.params.id
    })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {    //With this file name, we call unlink to delete the file
        Sauce.deleteOne({    //We delete the corresponding document from the database
            _id: req.params.id
          })
          .then(() => res.status(200).json({
            message: 'Sauce supprimée !'
          }))
          .catch(error => res.status(400).json({
            error
          }));
      });
    })
    .catch(error => res.status(500).json({
      error
    }));
};

//"like" or "dislaker" a sauce
exports.likeDislike = (req, res, next) => {
  let like = req.body.like    //Like present in the body
  let userId = req.body.userId
  let sauceId = req.params.id

  if (like === 1) {    //If it's a like
    Sauce.updateOne({
        _id: sauceId
      }, {
        $push: {    //We push the user and we increment the counter by 1
          usersLiked: userId
        },
        $inc: {
          likes: +1
        },    //We increment by 1
      })
      .then(() => res.status(200).json({
        message: 'j\'aime ajouté !'
      }))
      .catch((error) => res.status(400).json({
        error
      }))
  }
  if (like === -1) {
    Sauce.updateOne(    //If it is a dislike
        {
          _id: sauceId
        }, {
          $push: {
            usersDisliked: userId
          },
          $inc: {
            dislikes: +1
          },    //We increment by 1
        }
      )
      .then(() => {
        res.status(200).json({
          message: 'Dislike ajouté !'
        })
      })
      .catch((error) => res.status(400).json({
        error
      }))
  }
  if (like === 0) {    //If it is a question of canceling a like or a dislike
    Sauce.findOne({
        _id: sauceId
      })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {    //cancel a like
          Sauce.updateOne({
              _id: sauceId
            }, {
              $pull: {
                usersLiked: userId
              },
              $inc: {
                likes: -1
              },    //We increment by -1
            })
            .then(() => res.status(200).json({
              message: 'Like retiré !'
            }))
            .catch((error) => res.status(400).json({
              error
            }))
        }
        if (sauce.usersDisliked.includes(userId)) {    //cancel a dislike
          Sauce.updateOne({
              _id: sauceId
            }, {
              $pull: {
                usersDisliked: userId
              },
              $inc: {
                dislikes: -1
              },    //We increment by -1
            })
            .then(() => res.status(200).json({
              message: 'Dislike retiré !'
            }))
            .catch((error) => res.status(400).json({
              error
            }))
        }
      })
      .catch((error) => res.status(404).json({
        error
      }))
  }
}
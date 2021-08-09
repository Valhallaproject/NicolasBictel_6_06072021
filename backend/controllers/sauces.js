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
    let userId = req.body.userId;
    let like = req.body.like;
    let sauceId = req.params.id

    Sauce.findOne({ _id: req.params.id })
        .then( sauce => {

            switch (like) {
                case 1 : 
                    Sauce.updateOne({ _id: sauceId },{ $inc:{likes: +1}, $push:{usersLiked: userId}})    //increments 1 to "like"
                        .then(() => {
                            res.status(200).json({ message: "Like !"});
                        })
                        .catch(error => res.status(400).json({ error }));
                    break;
                case 0 : 
                    if (sauce.usersLiked.includes(userId)) {
                        Sauce.updateOne({ _id: sauceId}, { $inc:{likes: -1}, $pull:{usersLiked: userId}})    //decrements 1 to "like"
                            .then(() => {
                                res.status(200).json({ message: "Stop Like !"});
                            })
                            .catch(error => res.status(400).json({ error }));
                    }
                    else if (sauce.usersDisliked.includes(userId)) {
                        Sauce.updateOne({ _id: sauceId}, { $inc:{dislikes: -1}, $pull:{usersDisliked: userId}})    //decrements 1 to "dislike"
                        .then(() => {
                            res.status(200).json({ message: "Stop Dislike !"});
                        })
                        .catch(error => res.status(400).json({ error }));
                    } 
                    break;    
                case -1 : 
                    Sauce.updateOne({ _id: sauceId}, { $inc:{dislikes: +1}, $push:{usersDisliked: userId}})    //increments 1 to "dislike"
                        .then(() => {
                            res.status(200).json({ message: "Dislike !"});
                        })
                        .catch(error => res.status(400).json({ error }));
                    break;
                default : 
                    console.log("error");
            }
        })
        .catch(error => {
            res.status(404).json({ error })
        });  
};
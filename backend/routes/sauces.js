const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');    //authentication management
const multer = require('../middleware/multer-config');    //management of image files

const sauceCtrl =  require('../controllers/sauces');


router.post('/' ,auth, multer, sauceCtrl.addOneSauce);  
router.get('/'  ,auth , sauceCtrl.getAllSauce);
router.get('/:id' ,auth, sauceCtrl.getOneSauce)
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.likeDislike)


module.exports = router;
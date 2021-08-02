const multer = require('multer');    //import multer package

const MINE_TYPES = {    //accepted types of images
    'image/jpg' : 'jpg',
    'image/jpeg' : 'jpg',
    'image/png' : 'png'
};
//Save location and file name
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split('').join('_');
        const extension = MINE_TYPES[file.minetype];
        callback(null, name + Date.now() + '.' + extension)
    }
});

module.exports = multer({storage: storage}).single('image');
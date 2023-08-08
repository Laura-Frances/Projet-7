const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');// on passe l'argument auth dans nos routes à protéger
const multerSharp = require('../middleware/multer-sharp');
const bookCtrl = require('../controllers/books');

// définition des routes spécifiques 
router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestBooks); 
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, multerSharp.upload, multerSharp.optimizeImage, bookCtrl.createBook);
router.put('/:id', auth, multerSharp.upload, multerSharp.optimizeImage, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.rateBook);

module.exports = router;


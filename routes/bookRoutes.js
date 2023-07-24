const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // on passe l'argument auth dans nos routes à protéger

const bookCtrl = require ('../controllers/books');

// poster un livre
router.post('/', auth, bookCtrl.createBook);
// récupérer tous les livres 
router.get('/', auth, bookCtrl.getAllBooks);
// récupérer un seul livre
router.get('/:id', auth, bookCtrl.getOneBook);
// récupérer best livres
router.get('/bestrating', auth, bookCtrl.getBestBooks);
// modifier un livre
router.put('/:id', auth, bookCtrl.modifyBook);
// supprimer un livre
router.delete('/:id', auth, bookCtrl.deleteBook);



module.exports = router;
const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    // const rating = bookObject.rating;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });

    book.save()
        .then(() => { res.status(201).json({ message: 'Livre enregistré !' }) })
        .catch(() => { res.status(400).json({ message: 'Veuillez remplir tous les champs.'}) })
};

exports.getOneBook = (req, res) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
}

exports.modifyBook = (req, res) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject.userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
                Book.updateOne({ _id: req.params.id }, 
                  { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre modifié!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.rateBook = (req, res) => {

    const bookId = req.params.id; // on extrait l'id du livre
    const rating = req.body.rating; // on extrait la note du livre du corps de la requête
  
    // on s'assure que la note est un nombre valide
    if (!rating || isNaN(rating)) {
      return res.status(400).json({ error: 'La note est invalide.' });
    }
    
    // trouve le book avec l'id et met à jour son tableau ratings 
    Book.findByIdAndUpdate( 
      bookId,
      {
        $push: { // met à jour le tableau ratings
          ratings: {
            userId: req.auth.userId, 
            grade: rating
          }
        }
      },
      { new: true } // retourne le book mis à jour 
    )
      .then(updatedBook => { // promesse résolue 
        if (!updatedBook) {
          return res.status(404).json({ error: 'Livre non trouvé.' });
        }

        // Calcul de la note moyenne
        console.log('Ratings:', updatedBook.ratings);
        let totalRating = 0;
        for (let i = 0; i < updatedBook.ratings.length; i++) { // calcul de la somme totale des notes dans le ratings
          let currentRating = updatedBook.ratings[i].grade;
          totalRating += currentRating;
        }
        console.log('Total Rating:', totalRating);
        updatedBook.averageRating = totalRating / updatedBook.ratings.length; // calcul de la note moyenne
        updatedBook.averageRating = parseFloat(updatedBook.averageRating.toFixed(1)); // on arrondi la noye moyenne à 1 décimale
  
        // sauvegarde du book mis à jour avec la nouvelle note
        return updatedBook.save();
      })
      .then(book => {
        console.log('Book saved:', book);
        res.status(201).json(book);
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ error: 'Une erreur s\'est produite.' });
      });
  };

exports.getBestBooks = (req, res, next) => {
    Book.find()
      .sort({ averageRating: -1 }) // Trie par ordre décroissant de la propriété `averageRating`
      .limit(3) // Récupère les trois premiers livres après le tri
      .then((books) => {
        res.status(200).json(books);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  };

exports.deleteBook = (req, res) => {
    Book.findOne({ _id: req.params.id }) // on recherche un livre spécifique dans la base de données
        .then(book => { // on exécute le livre trouvé
            if (book.userId != req.auth.userId) { // on vérifie l'auth de l'user 
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => { // on supprime l'image associée au livre
                    Book.deleteOne({ _id: req.params.id }) // onsupprime le livre de la DB 
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(404).json({ error }));
}

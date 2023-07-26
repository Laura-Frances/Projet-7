const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        averageRating: 0,
    });

    book.save()
        .then(() => { res.status(201).json({ message: 'Livre enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) })
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
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre modifié!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};
// A CORRIGER 
exports.rateBook = (req, res) => {
    // Get the book ID from the URL parameters
    const bookId = req.params.id;
  
    // Get the rating value from the request body
    const rating = req.body.rating;
  
    // Make sure the rating is a valid number
    if (!rating || isNaN(rating)) {
      return res.status(400).json({ error: 'La note est invalide.' });
    }
  
    // Find the book by ID and update its ratings array
    Book.findByIdAndUpdate(
      bookId,
      {
        $push: {
          ratings: {
            userId: req.auth.userId,
            grade: rating
          }
        }
      },
      { new: true } // This option returns the updated book after the update is applied
    )
      .then(updatedBook => {
        if (!updatedBook) {
          return res.status(404).json({ error: 'Livre non trouvé.' });
        }
  
        // Calculate the new average rating
        let totalRating = 0;
        for (let i = 0; i < updatedBook.ratings.length; i++) {
          let currentRating = updatedBook.ratings[i].grade;
          totalRating += currentRating;
        }
        updatedBook.averageRating = totalRating / updatedBook.ratings.length;
  
        // Save the book with the updated average rating
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
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
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

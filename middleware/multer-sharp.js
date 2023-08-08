// on gère ici les images téléchargées, on les optimise et on supprime l'originale pour libérer de l'espace

const fs = require('fs'); // Module pour manipuler les fichiers
const multer = require('multer'); // Module pour gérer le téléchargement de fichiers
const sharp = require('sharp'); // Importation de la bibliothèque Sharp
const path = require('path'); // Module pour gérer les chemins de fichiers

const MIME_TYPES = { // on contrôle le format d'images téléchargées
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

const storage = multer.diskStorage({ // configuration du stockage des img téléchargées avec Multer
  destination: (req, file, callback) => {
    callback(null, 'images/imagesTransition'); // répertoire de destination pour les img téléchargées
  },
  filename: (req, file, callback) => { // configure le nom de l'img
    const name = file.originalname.split(' ').join('_'); // on génère le nom de fichier en remplaçant les espaces par des _
    const extension = MIME_TYPES[file.mimetype]; // extension à partir du type MIME 
    callback(null, name + Date.now() + '.' + extension);
  }
});

const upload = multer({ // utilisation de multer pour la gestion des fichiers
  storage: storage,
  limits: { fileSize: 200 * 1024 }, // limite de taille des fichiers (200 Ko)
}).single('image');

const optimizeImage = (req, res, next) => { // Middleware pour optimiser l'image avec Sharp avant de l'enregistrer
  if (!req.file) {
    return next();
  }
  
// chemin de transition pour l'accès aux images téléchargées avant optimisation
  const imagePath = path.join(__dirname, '..', 'images/imagesTransition', req.file.filename);
  console.log('Original image path:', imagePath);

  // chemin d'accès pour le fichier optimisé
  const optimizedImagePath = path.join(__dirname, '..', 'images', req.file.filename);
  console.log('Optimized image path:', optimizedImagePath);

  // utilisation de Sharp pour redimensionner et compresser l'image
  sharp(imagePath)
    .toFormat('jpeg')
    .jpeg({ quality: 80 })
    .toFile(optimizedImagePath, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de l\'optimisation de l\'image' });
      }
      console.log('Image optimized successfully');

    // on supprime l'image originale du répertoire imagesTransition
      setTimeout(() => {
        fs.unlink(imagePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting original image:', unlinkErr);
          } else {
            console.log('Original image deleted successfully');
          }
          next();
        });
      }, 1000); // délai avant de supprimer l'img originale
    });
};
module.exports = { upload, optimizeImage };

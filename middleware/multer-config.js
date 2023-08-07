// on gère ici les fichiers téléchargés (images) dans nos requêtes HTTP

const multer = require('multer');
const MIME_TYPES = { // Filtrage des formats pris en charge
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

const storage = multer.diskStorage({ // détermine où sauvegarder les img téléchargés et comment les renommer
  destination: (req, file, callback) => { 
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

// On exporte multer et on indique que l'on gère uniquement les telechargements de fichiers "image"
module.exports = multer({ storage: storage, limits: { fileSize: 200 * 1024 } }).single('image'); //spécifie une limite de taille de fichier de 200 kilo-octets
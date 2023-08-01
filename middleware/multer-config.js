const multer = require('multer');
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({ // la méthode diskStorage()  configure le chemin et le nom de fichier pour les fichiers entrants
  destination: (req, file, callback) => { // on définit la fonction pour indiquer à multer où enregistrer les fichiers entrants
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
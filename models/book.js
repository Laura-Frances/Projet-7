const mongoose = require('mongoose');
const axios = require('axios');

const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [
    {
      userId: { type: String, required: true },
      grade: { type: Number, required: true },
    }
  ], // Notes données à un livre
  averageRating: { type: Number, default: 0 },
});

// Fonction pour obtenir une image aléatoire
async function getRandomImage() {
  try {
    const response = await axios.get('https://picsum.photos/200/300'); // image aléatoire via picsum
    const imageUrl = response.request.res.responseUrl; // Récupère l'URL de l'image aléatoire
    return imageUrl;
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération de l\'image aléatoire :', error);
    return null;
  }
}

// Middleware pour générer une URL d'image aléatoire avant de sauvegarder le livre
bookSchema.pre('save', async function (next) {
  if (!this.imageUrl) {
    this.imageUrl = await getRandomImage();
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
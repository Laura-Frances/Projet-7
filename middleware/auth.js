const jwt = require('jsonwebtoken');
require('dotenv').config();

// middleware permettant de vérifier si l'user est authentifié, et autorise l'accès à certaines routes protégées

module.exports = (req, res, next) => { // middleware exporté dans nos fichiers routeurs
   try {
       const token = req.headers.authorization.split(' ')[1]; // extraction du token
       console.log('Extracted token:', token);
       const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET); // on utilise la fonction verify pour vérifier et décoder le token
       const userId = decodedToken.userId; // on extrait l'ID de l'user à partir du token décodé
       req.auth = { // on transmet l'ID de l'user authentifié aux routes ayant besoin de cette info
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ message: 'Une erreur est survenue' });
   }
};
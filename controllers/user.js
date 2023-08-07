const bcrypt = require('bcrypt'); // bibliothèque bcrypt pour le cryptage du mdp
const jwt = require('jsonwebtoken'); // bibliothèque pour générer des jetons d'auth

const User = require('../models/user');
require('dotenv').config(); // bibliothèque pour charger les variables d'environnement (identifiants de mongoDB)

// enregistrement d'un utilisateur
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // cryptage du mdp
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error: error.message }));
                    })
        .catch(error => res.status(500).json({ error }));
};

// connexion de l'utilisateur
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
            }
            bcrypt.compare(req.body.password, user.password) // on compare le mdp de la requête et le mdp de la database 
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    res.status(200).json({ // si les mdp concordent, alors on renvoie un objet json avec l'id et le token
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn:'24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };
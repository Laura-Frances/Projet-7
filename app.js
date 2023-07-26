const express = require('express');
const mongoose = require('mongoose');

const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/user');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect('mongodb+srv://laurafrances:vieuxgrimoire1@cluster0.54fecbj.mongodb.net/?retryWrites=true&w=majority', 
{ useNewUrlParser: true,
  useUnifiedTopology: true, })
  .then(() => { console.log('Connecté à MongoDB');})
  .catch((error) => { console.error('Erreur de connexion à MongoDB', error);});

  const app = express();
  app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// on importe nos Routes
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;


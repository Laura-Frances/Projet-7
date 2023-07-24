const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/user');

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000'
}))
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Connect to MongoDB
mongoose.connect('mongodb+srv://laurafrances:vieuxgrimoire1@cluster0.54fecbj.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connecté à MongoDB');
  })
  .catch((error) => {
    console.error('Erreur de connexion', error);
  });

// Routes

app.use(bodyParser.json());
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);


module.exports = app;
const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');

const {
    getAllEtudiants,
    getEtudiantById
} = require('../controllers/etudiant.controller');


// Toutes les routes protégées
router.get('/', verifyToken, getAllEtudiants);

router.get('/:id', verifyToken, getEtudiantById);

module.exports = router;
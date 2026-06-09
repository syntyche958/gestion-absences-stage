const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');

const {
    getAllDossiers,
    getDossierById
} = require('../controllers/dossier.controller');

router.get('/', verifyToken, getAllDossiers);
router.get('/:id', verifyToken, getDossierById);

module.exports = router;
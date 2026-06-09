const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');

const {
    getAllHistorique,
    getHistoriqueByDossier
} = require('../controllers/historique.controller');

router.get('/', verifyToken, getAllHistorique);
router.get('/dossier/:id_dossier', verifyToken, getHistoriqueByDossier);

module.exports = router;
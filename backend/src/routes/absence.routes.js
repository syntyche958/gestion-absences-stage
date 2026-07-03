const express  = require('express');

const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');

const { createAbsence, getAllAbsences, getSuiviAbsences, getAbsencesByEtudiant, recalculerSeuilsTousEtudiants} = require('../controllers/absence.controller');

// Routes protegées

router.post('/', verifyToken, createAbsence);

router.get('/', verifyToken, getAllAbsences);

router.get('/suivi', verifyToken, getSuiviAbsences);

router.get('/etudiant/:id', verifyToken, getAbsencesByEtudiant);

router.post('/recalculer-seuils', verifyToken, recalculerSeuilsTousEtudiants);

module.exports = router;
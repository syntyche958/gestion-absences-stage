const express  = require('express');

const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');

const { createAbsence, getAllAbsences, getSuiviAbsences, getAbsencesByEtudiant} = require('../controllers/absence.controller');

// Routes protegées

router.post('/', verifyToken, createAbsence);

router.get('/', verifyToken, getAllAbsences);

router.get('/suivi', verifyToken, getSuiviAbsences);

router.get('/etudiant/:id', verifyToken, getAbsencesByEtudiant);

module.exports = router;
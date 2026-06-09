const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');

const {
    createDisponibilite,
    getAllDisponibilites
} = require('../controllers/disponibilite.controller');

router.post('/', verifyToken, createDisponibilite);
router.get('/', verifyToken, getAllDisponibilites);

module.exports = router;
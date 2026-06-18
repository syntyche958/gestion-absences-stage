const express = require('express');

const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');

const {
    getAllActions,
    getActionById,
    getActionsByDossier,
    updateAction
} = require('../controllers/action.controller');

router.get('/', verifyToken, getAllActions);

router.get ('/:id', verifyToken, getActionById);

router.get('/dossier/:id',verifyToken,getActionsByDossier);

router.put('/:id', verifyToken, updateAction);

module.exports = router;
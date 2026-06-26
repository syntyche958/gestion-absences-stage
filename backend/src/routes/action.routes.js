const express = require('express');

const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');

const {
    getAllActions,
    getActionsByDossier,
    getActionById,    
    updateAction
} = require('../controllers/action.controller');

router.get('/', verifyToken, getAllActions);

router.get('/dossier/:id',verifyToken,getActionsByDossier);

router.get ('/:id', verifyToken, getActionById);

router.put('/:id', verifyToken, updateAction);

module.exports = router;
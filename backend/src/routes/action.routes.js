const express = require('express');

const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');

const {
    getAllActions,
    getActionById,
    updateAction
} = require('../controllers/action.controller');

router.get('/', verifyToken, getAllActions);

router.get ('/:id', verifyToken, getActionById);

router.put('/:id', verifyToken, updateAction);

module.exports = router;
const express = require('express');

const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');

const {
    createConvocation,
    getAllConvocation,
    getConvocationById,
    updateConvocation,
    deleteConvocation
} = require('../controllers/convocation.controller');

router.post('/', verifyToken, createConvocation);

router.get ('/', verifyToken, getAllConvocation);

router.get('/:id', verifyToken, getConvocationById);

router.put('/:id', verifyToken, updateConvocation);

router.delete('/:id', verifyToken, deleteConvocation);

module.exports = router;
const express = require('express')
const router = express.Router()

const verifyToken = require('../middlewares/auth.middleware')

const {
  getNotificationsByDossier
} = require('../controllers/notification.controller')

router.get('/dossier/:id', verifyToken, getNotificationsByDossier)

module.exports = router
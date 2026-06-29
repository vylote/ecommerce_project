const express = require('express')
const router = express.Router()
const { handleNotify } = require('../controllers/notify.controller')

router.post('/', handleNotify)

module.exports = router
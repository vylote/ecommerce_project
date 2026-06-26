require ('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const { initSocket } = require('../src/services/socket.service')
const notifyRoutes = require('../src/routes/notify.routes')

const app = express()
// Tạo server HTTP thuần (Socket.io cần server này thay vì app express thông thường)
const server = http.createServer(app)

app.use(cors())
app.use(express.json())

initSocket(server)

app.use('/notify', notifyRoutes)

const PORT = process.env.PORT
server.listen(PORT, () => {
    console.log(`Notification service is running on port ${PORT}`)
})

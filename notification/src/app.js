require ('dotenv').config()
const express = require('express') //framework dùng để build web server và RESTful API 
const http = require('http')
const cors = require('cors') // cung cấp middleware xử lí Cross-Origin Resource Sharing
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

const socketIo = require('socket.io')

let io

const initSocket = (server) => {
    io = socketIo(server, {
        cors: { origin: '*'} // khi production thì đổi thành domain thực tê của fe-> chống hack
    })

    io.on('connection', (socket) => {
        console.log(`[+] Client connected: ${socket.id}`)

        socket.on('join', (userId) => {
            socket.join(userId.toString())
            console.log(`[i] User ${userId} đã tham gia room: ${userId}`)
        })

        socket.on('disconnect', () => {
            console.log(`[-] Client disconnected: ${socket.id}`)
        })
    })
}

// Hàm dùng để đẩy thông báo đích danh
const emitNotification = (userId, payload) => {
    if (io) {
        // Chỉ gửi tin nhắn vào đúng room có tên là userId
        io.to(userId.toString()).emit('new_notification', payload);
        console.log(`[🚀] Đã đẩy thông báo tới User ${userId}`);
    }
};

module.exports = { initSocket, emitNotification }
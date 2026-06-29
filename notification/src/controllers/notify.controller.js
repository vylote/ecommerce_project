const socketService = require('../services/socket.service')

const handleNotify = (req, res) => {
    // lấy dữ liệu từ req body do NotificationClient gửi 
    const { userId, type, title, message, refId } = req.body

    const notificationPayload = {
        type, 
        title,
        message,
        refId,
        createdAt: new Date().toISOString()
    }

    socketService.emitNotification(userId, notificationPayload)
    return res.status(200).json({
        success: true, 
        message: "Đã gửi thông báo thành công"
    })
}

module.exports = { handleNotify }
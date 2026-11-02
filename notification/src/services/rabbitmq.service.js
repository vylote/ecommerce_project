const amqp = require('amqplib');
const socketService = require('./socket.service');

const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'localhost';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672;
const RABBITMQ_USERNAME = process.env.RABBITMQ_USERNAME || 'guest';
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || 'guest';
const vhostParam = process.env.RABBITMQ_VHOST;
const vhostPath = (!vhostParam || vhostParam === '/') ? '' : encodeURIComponent(vhostParam);

const RABBITMQ_URL = process.env.RABBITMQ_URL || `amqp://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}/${vhostPath}`;
const QUEUE_NAME = 'notification.queue';
const FANOUT_EXCHANGE_NAME = 'notification.fanout.exchange';
const EXCHANGE_NAME = 'notification.exchange';
const ROUTING_KEY = 'notification.routing.key';

let channel = null;

const initRabbitMQ = async () => {
    try {
        console.log(`[*] Connecting to RabbitMQ at ${RABBITMQ_URL}...`);
        const connection = await amqp.connect(RABBITMQ_URL);
        
        connection.on('error', (err) => {
            console.error('[!] RabbitMQ connection error:', err.message);
        });

        connection.on('close', () => {
            console.warn('[!] RabbitMQ connection closed. Reconnecting in 5s...');
            setTimeout(initRabbitMQ, 5000);
        });

        channel = await connection.createChannel();
        await channel.assertExchange(FANOUT_EXCHANGE_NAME, 'fanout', { durable: true });
        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        await channel.bindQueue(QUEUE_NAME, FANOUT_EXCHANGE_NAME, '');
        await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

        console.log(`[+] RabbitMQ connected. Bound ${QUEUE_NAME} to fanout exchange: ${FANOUT_EXCHANGE_NAME}`);

        channel.consume(QUEUE_NAME, (msg) => {
            if (msg !== null) {
                try {
                    const contentStr = msg.content.toString();
                    const data = JSON.parse(contentStr);
                    console.log('[i] Received notification from RabbitMQ:', data);

                    const userId = data.userId;
                    const notificationPayload = {
                        id: data.id || null,
                        type: data.type,
                        title: data.title,
                        message: data.message,
                        isRead: data.isRead ?? false,
                        readAt: data.readAt || null,
                        refId: data.refId,
                        createdAt: data.createdAt || new Date().toISOString()
                    };

                    if (userId) {
                        socketService.emitNotification(userId, notificationPayload);
                    }

                    channel.ack(msg);
                } catch (parseErr) {
                    console.error('[!] Error processing notification message:', parseErr.message);
                    channel.nack(msg, false, false); // Không re-queue nếu tin nhắn bị lỗi cú pháp
                }
            }
        });
    } catch (error) {
        console.error('[!] Failed to connect to RabbitMQ:', error.message);
        console.log('[i] Retrying RabbitMQ connection in 5s...');
        setTimeout(initRabbitMQ, 5000);
    }
};

module.exports = { initRabbitMQ };

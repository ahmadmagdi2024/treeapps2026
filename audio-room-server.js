/**
 * =====================================================
 * WebSocket Audio Room Server
 * =====================================================
 * خادم WebSocket محلي للبث الصوتي المباشر
 * بدون الحاجة لخدمات خارجية مثل LiveKit
 * =====================================================
 */

import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

const app = express();

// CORS configuration
const corsOptions = {
    origin: ALLOWED_ORIGINS === '*' ? '*' : ALLOWED_ORIGINS.split(','),
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

// تخزين الغرف والمشاركين
const rooms = new Map();
const participants = new Map();

// =====================================================
// WebSocket Connection Handler
// =====================================================
wss.on('connection', (ws, req) => {
    console.log('🔌 New WebSocket connection');

    let currentRoomId = null;
    let currentUserId = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            handleMessage(ws, data);
        } catch (error) {
            console.error('❌ Error parsing message:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
    });

    ws.on('close', () => {
        console.log('🔌 WebSocket disconnected');
        if (currentRoomId && currentUserId) {
            leaveRoom(currentRoomId, currentUserId);
        }
    });

    // =====================================================
    // Message Handler
    // =====================================================
    function handleMessage(ws, data) {
        const { type, roomId, userId, payload } = data;

        switch (type) {
            case 'join':
                joinRoom(ws, roomId, userId, payload);
                break;

            case 'leave':
                leaveRoom(roomId, userId);
                break;

            case 'offer':
                forwardToParticipant(roomId, payload.targetUserId, {
                    type: 'offer',
                    fromUserId: userId,
                    offer: payload.offer
                });
                break;

            case 'answer':
                forwardToParticipant(roomId, payload.targetUserId, {
                    type: 'answer',
                    fromUserId: userId,
                    answer: payload.answer
                });
                break;

            case 'ice-candidate':
                forwardToParticipant(roomId, payload.targetUserId, {
                    type: 'ice-candidate',
                    fromUserId: userId,
                    candidate: payload.candidate
                });
                break;

            case 'mute':
                broadcastToRoom(roomId, {
                    type: 'participant-muted',
                    userId,
                    isMuted: payload.isMuted
                }, userId);
                break;

            case 'hand-raise':
                broadcastToRoom(roomId, {
                    type: 'hand-raised',
                    userId,
                    isRaised: payload.isRaised
                }, userId);
                break;

            default:
                console.warn('⚠️ Unknown message type:', type);
        }
    }

    // =====================================================
    // Room Management
    // =====================================================
    function joinRoom(ws, roomId, userId, userInfo) {
        currentRoomId = roomId;
        currentUserId = userId;

        // إنشاء الغرفة إذا لم تكن موجودة
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map());
        }

        const room = rooms.get(roomId);
        
        // إضافة المشارك
        room.set(userId, {
            ws,
            userId,
            userInfo,
            joinedAt: Date.now()
        });

        participants.set(userId, { roomId, ws });

        console.log(`✅ User ${userId} joined room ${roomId}`);

        // إرسال قائمة المشاركين الحاليين للمشارك الجديد
        const existingParticipants = Array.from(room.entries())
            .filter(([id]) => id !== userId)
            .map(([id, participant]) => ({
                userId: id,
                userInfo: participant.userInfo
            }));

        ws.send(JSON.stringify({
            type: 'joined',
            roomId,
            participants: existingParticipants
        }));

        // إخبار المشاركين الآخرين بالمشارك الجديد
        broadcastToRoom(roomId, {
            type: 'participant-joined',
            userId,
            userInfo
        }, userId);
    }

    function leaveRoom(roomId, userId) {
        const room = rooms.get(roomId);
        if (!room) return;

        room.delete(userId);
        participants.delete(userId);

        console.log(`👋 User ${userId} left room ${roomId}`);

        // إخبار المشاركين الآخرين
        broadcastToRoom(roomId, {
            type: 'participant-left',
            userId
        });

        // حذف الغرفة إذا كانت فارغة
        if (room.size === 0) {
            rooms.delete(roomId);
            console.log(`🗑️ Room ${roomId} deleted (empty)`);
        }
    }

    // =====================================================
    // Broadcasting
    // =====================================================
    function broadcastToRoom(roomId, message, excludeUserId = null) {
        const room = rooms.get(roomId);
        if (!room) return;

        const messageStr = JSON.stringify(message);

        room.forEach((participant, userId) => {
            if (userId !== excludeUserId && participant.ws.readyState === 1) {
                participant.ws.send(messageStr);
            }
        });
    }

    function forwardToParticipant(roomId, targetUserId, message) {
        const room = rooms.get(roomId);
        if (!room) return;

        const participant = room.get(targetUserId);
        if (participant && participant.ws.readyState === 1) {
            participant.ws.send(JSON.stringify(message));
        }
    }
});

// =====================================================
// HTTP API Endpoints
// =====================================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        rooms: rooms.size,
        participants: participants.size,
        timestamp: new Date().toISOString()
    });
});

// Get room info
app.get('/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    const participantsList = Array.from(room.entries()).map(([userId, participant]) => ({
        userId,
        userInfo: participant.userInfo,
        joinedAt: participant.joinedAt
    }));

    res.json({
        roomId,
        participantCount: room.size,
        participants: participantsList
    });
});

// Get all active rooms
app.get('/rooms', (req, res) => {
    const roomsList = Array.from(rooms.entries()).map(([roomId, room]) => ({
        roomId,
        participantCount: room.size
    }));

    res.json({
        rooms: roomsList,
        totalRooms: rooms.size,
        totalParticipants: participants.size
    });
});

// =====================================================
// Start Server
// =====================================================
server.listen(PORT, () => {
    console.log('🎙️ =====================================================');
    console.log('🎙️  Audio Room WebSocket Server');
    console.log('🎙️ =====================================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${NODE_ENV}`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    console.log(`🌐 HTTP API: http://localhost:${PORT}`);
    console.log(`🔒 CORS: ${ALLOWED_ORIGINS}`);
    console.log('🎙️ =====================================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, closing server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});



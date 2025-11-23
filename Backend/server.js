// server.js - Main Caly Server
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http');
const WebSocket = require('ws');
const logger = require('./utils/logger');
const db = require('./db/postgres');
const sessionManager = require('./sessions/CallSessionManager');

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server, path: '/audio' });

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw({ type: 'audio/wav', limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'caly-voice-agent',
    version: '1.0.0'
  });
});

// Exotel webhooks
app.post('/webhooks/exotel/call-start', require('./routes/exotel').handleCallStart);
app.post('/webhooks/exotel/call-end', require('./routes/exotel').handleCallEnd);
app.post('/webhooks/exotel/recording', require('./routes/exotel').handleRecording);

// Dashboard API routes
app.use('/api/calls', require('./routes/calls'));
app.use('/api/actions', require('./routes/actions'));
app.use('/api/analytics', require('./routes/analytics'));

// WebSocket connection for audio streaming
wss.on('connection', async (ws, req) => {
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  const callId = urlParams.get('callId');
  
  if (!callId) {
    logger.error('WebSocket connection rejected - no callId');
    ws.close();
    return;
  }

  logger.info('WebSocket connection established', { callId });

  try {
    // Get call data
    const call = await db.calls.getById(callId);
    
    if (!call) {
      logger.error('Call not found', { callId });
      ws.close();
      return;
    }

    // Create audio session
    await sessionManager.createSession(callId, call);

    // Handle incoming audio chunks from Exotel
    ws.on('message', async (data) => {
      try {
        // Audio data from Exotel (should be PCM16, 16kHz, mono)
        const audioChunk = Buffer.from(data);
        
        // Send to session manager for processing
        sessionManager.processIncomingAudio(callId, audioChunk);
        
      } catch (error) {
        logger.error('Error processing audio chunk', { 
          callId, 
          error: error.message 
        });
      }
    });

    // Handle session audio output (TTS to send back to Exotel)
    sessionManager.on('audio_output', (data) => {
      if (data.callId === callId && ws.readyState === WebSocket.OPEN) {
        ws.send(data.audioData);
      }
    });

    // Handle action requests
    sessionManager.on('action_requested', async (data) => {
      if (data.callId === callId) {
        logger.info('Action requested from LLM', {
          callId,
          actionType: data.actionType
        });
        
        // TODO: Execute action via backend executor (Phase 3)
        // For now, just log it
        
        // Example mock result
        const mockResult = {
          success: true,
          data: { status: 'in_transit', eta: '2025-11-24T18:00:00+05:30' }
        };
        
        // Send result back to LLM
        setTimeout(() => {
          sessionManager.handleActionResult(
            callId, 
            data.callId, 
            mockResult
          );
        }, 500);
      }
    });

    ws.on('close', async () => {
      logger.info('WebSocket connection closed', { callId });
      await sessionManager.endSession(callId);
    });

    ws.on('error', (error) => {
      logger.error('WebSocket error', { callId, error: error.message });
    });

  } catch (error) {
    logger.error('Error setting up audio session', {
      callId,
      error: error.message
    });
    ws.close();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  wss.close(() => {
    logger.info('WebSocket server closed');
  });
  
  await db.close();
  logger.info('Database connections closed');
  
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, async () => {
  logger.info(`🚀 Caly server running on ${HOST}:${PORT}`);
  logger.info(`📞 Exotel webhooks ready`);
  logger.info(`🎧 WebSocket audio server on ws://${HOST}:${PORT}/audio`);
  
  // Test database connection
  try {
    await db.testConnection();
    logger.info('✅ Database connection successful');
  } catch (error) {
    logger.error('❌ Database connection failed', { error: error.message });
  }
});

module.exports = { app, server, wss };
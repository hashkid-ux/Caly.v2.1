// sessions/CallSessionManager.js - Main call session orchestrator
const STSSession = require('../realtime/stsSession');
const IntentDetector = require('../agents/intentDetector');
const AgentOrchestrator = require('../agents/orchestrator');
const logger = require('../utils/logger');
const db = require('../db/postgres');
const EventEmitter = require('events');

class CallSessionManager extends EventEmitter {
  constructor() {
    super();
    this.sessions = new Map();
    this.intentDetector = new IntentDetector();
    this.agentOrchestrator = AgentOrchestrator;
  }

  /**
   * Create new call session
   * @param {string} callId - Call identifier
   * @param {object} callData - Call metadata
   */
  async createSession(callId, callData) {
    try {
      logger.info('Creating call session', { callId });

      // Initialize STS session
      const stsSession = new STSSession(process.env.OPENAI_API_KEY);

      const session = {
        callId,
        callData,
        stsSession,
        conversationHistory: [],
        startTime: Date.now(),
        isActive: true,
        currentIntent: null,
        waitingForEntity: null
      };

      // Setup STS event handlers
      this.setupSTSHandlers(session);

      // Setup agent orchestrator handlers
      this.setupAgentHandlers(session);

      // Start STS session
      await stsSession.start(callId);

      // Store session
      this.sessions.set(callId, session);

      logger.info('Call session created successfully', { callId });

      return session;

    } catch (error) {
      logger.error('Error creating call session', { 
        callId,
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Setup STS event handlers
   */
  setupSTSHandlers(session) {
    const { callId, stsSession } = session;

    // User started speaking
    stsSession.on('speech_started', () => {
      logger.debug('User speech started', { callId });
      // User interrupted - could cancel any TTS if needed
    });

    // User stopped speaking
    stsSession.on('speech_stopped', () => {
      logger.debug('User speech stopped', { callId });
    });

    // User transcript completed - CRITICAL EVENT
    stsSession.on('user_transcript_completed', async (data) => {
      logger.info('USER SAID', { 
        callId,
        transcript: data.transcript 
      });

      // Store in conversation history
      session.conversationHistory.push({
        role: 'user',
        content: data.transcript,
        timestamp: Date.now()
      });

      // Save to database
      try {
        await db.entities.create({
          call_id: callId,
          entity_type: 'transcript_user',
          value: data.transcript,
          confidence: 1.0
        });
      } catch (error) {
        logger.error('Error saving transcript', { 
          callId,
          error: error.message 
        });
      }

      // Detect intent
      const detection = this.intentDetector.detect(
        data.transcript,
        session.conversationHistory
      );

      logger.info('Intent detected', { 
        callId,
        intent: detection.intent,
        confidence: detection.confidence,
        requiresAgent: detection.requiresAgent,
        entities: detection.entities
      });

      // Handle based on intent
      await this.handleIntent(session, detection);
    });

    // AI transcript completed
    stsSession.on('ai_transcript_completed', async (data) => {
      logger.info('AI SAID', { 
        callId,
        transcript: data.transcript 
      });

      // Store in conversation history
      session.conversationHistory.push({
        role: 'assistant',
        content: data.transcript,
        timestamp: Date.now()
      });

      // Save to database
      try {
        await db.entities.create({
          call_id: callId,
          entity_type: 'transcript_assistant',
          value: data.transcript,
          confidence: 1.0
        });
      } catch (error) {
        logger.error('Error saving AI transcript', { 
          callId,
          error: error.message 
        });
      }
    });

    // Audio output - stream to Exotel
    stsSession.on('audio_output', (audioChunk) => {
      // Emit to be sent to Exotel
      this.emit('audio_output', {
        callId,
        audioData: audioChunk
      });
    });

    // Error handling
    stsSession.on('error', (error) => {
      logger.error('STS error', { callId, error: error.message });
      this.emit('session_error', { callId, component: 'sts', error });
    });
  }

  /**
   * Setup agent orchestrator handlers
   */
  setupAgentHandlers(session) {
    const { callId } = session;

    // Agent needs more info
    this.agentOrchestrator.on('agent_needs_info', (data) => {
      if (data.callId !== callId) return;

      logger.info('Agent needs info', { 
        callId,
        field: data.field,
        prompt: data.prompt 
      });

      // Update STS context so AI knows to ask for this info
      const contextUpdate = `SYSTEM: ${data.prompt}. Ask user naturally for this information in Hindi.`;
      session.stsSession.updateContext(contextUpdate);

      // Track what we're waiting for
      session.waitingForEntity = data.field;
    });

    // Agent completed
    this.agentOrchestrator.on('agent_completed', async (data) => {
      if (data.callId !== callId) return;

      logger.info('Agent completed', { 
        callId,
        agentType: data.agentType,
        success: data.result.success 
      });

      // Update STS context with agent result
      const contextUpdate = `SYSTEM: ${data.result.contextUpdate}`;
      session.stsSession.updateContext(contextUpdate);

      session.currentIntent = null;
      session.waitingForEntity = null;
    });

    // Agent error
    this.agentOrchestrator.on('agent_error', (data) => {
      if (data.callId !== callId) return;

      logger.error('Agent error', { 
        callId,
        agentType: data.agentType,
        error: data.error.message 
      });

      // Update STS to inform user of error
      const contextUpdate = `SYSTEM: Technical issue occurred. Apologize to user and offer to create a support ticket. Say in Hindi: "Maaf kijiye sir, thoda technical issue aa raha hai. Main aapka ticket create kar deti hoon, team 24 ghante mein contact karegi."`;
      session.stsSession.updateContext(contextUpdate);
    });

    // Agent cancelled
    this.agentOrchestrator.on('agent_cancelled', (data) => {
      if (data.callId !== callId) return;

      logger.info('Agent cancelled', { 
        callId,
        agentType: data.agentType 
      });

      session.currentIntent = null;
      session.waitingForEntity = null;
    });
  }

  /**
   * Handle detected intent
   */
  async handleIntent(session, detection) {
    const { callId } = session;

    // Handle cancellation
    if (detection.shouldCancelAgent) {
      logger.info('User requested cancellation', { callId });
      
      // Cancel active agent
      await this.agentOrchestrator.cancelAgent(callId);
      
      // Update context
      session.stsSession.updateContext(
        'SYSTEM: User cancelled the action. Acknowledge politely: "Ji sir, koi baat nahi. Kuch aur batayiye?"'
      );
      return;
    }

    // Normal chat - no agent needed
    if (!detection.requiresAgent) {
      logger.debug('Normal conversation, no agent needed', { 
        callId,
        intent: detection.intent 
      });
      return; // STS handles conversation naturally
    }

    // Agent-triggering intent detected
    logger.info('Launching agent', { 
      callId,
      intent: detection.intent,
      agentType: detection.agentType,
      entities: detection.entities 
    });

    session.currentIntent = detection.intent;

    // Check if we're waiting for specific entity
    if (session.waitingForEntity && detection.entities[session.waitingForEntity]) {
      // User provided the entity we were waiting for
      logger.info('Received expected entity', { 
        callId,
        entity: session.waitingForEntity,
        value: detection.entities[session.waitingForEntity] 
      });

      // Update active agent with new data
      this.agentOrchestrator.updateAgent(callId, detection.entities);
      session.waitingForEntity = null;
      return;
    }

    // Launch new agent
    try {
      await this.agentOrchestrator.launchAgent(
        callId,
        detection.agentType,
        detection.entities
      );
    } catch (error) {
      logger.error('Error launching agent', { 
        callId,
        error: error.message 
      });

      // Inform user of error
      session.stsSession.updateContext(
        'SYSTEM: Could not process request. Apologize: "Maaf kijiye, thodi problem aa rahi hai. Kuch aur madad kar sakti hoon?"'
      );
    }
  }

  /**
   * Process incoming audio from Exotel
   * @param {string} callId - Call identifier
   * @param {Buffer} audioData - Audio chunk
   */
  processIncomingAudio(callId, audioData) {
    const session = this.sessions.get(callId);

    if (!session || !session.isActive) {
      logger.warn('Cannot process audio, session not found or inactive', { 
        callId 
      });
      return;
    }

    // Send audio to STS
    session.stsSession.sendAudio(audioData);
  }

  /**
   * Get session
   */
  getSession(callId) {
    return this.sessions.get(callId);
  }

  /**
   * End call session
   */
  async endSession(callId) {
    const session = this.sessions.get(callId);

    if (!session) {
      logger.warn('Session not found for ending', { callId });
      return;
    }

    try {
      logger.info('Ending call session', { callId });

      session.isActive = false;

      // Cancel any active agents
      await this.agentOrchestrator.cancelAgent(callId);

      // Stop STS session
      await session.stsSession.stop();

      // Save final transcript
      const fullTranscript = session.conversationHistory
        .map(t => `${t.role}: ${t.content}`)
        .join('\n');

      await db.calls.update(callId, {
        transcript_full: fullTranscript,
        end_ts: new Date()
      });

      // Remove session
      this.sessions.delete(callId);

      logger.info('Call session ended successfully', { 
        callId,
        duration: Date.now() - session.startTime 
      });

    } catch (error) {
      logger.error('Error ending call session', { 
        callId,
        error: error.message 
      });
    }
  }

  /**
   * Get all active sessions
   */
  getActiveSessions() {
    return Array.from(this.sessions.keys());
  }

  /**
   * Get session count
   */
  getSessionCount() {
    return this.sessions.size;
  }
}

// Singleton instance
const sessionManager = new CallSessionManager();

module.exports = sessionManager;
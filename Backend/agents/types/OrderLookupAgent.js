// agents/types/OrderLookupAgent.js - Order lookup agent
const BaseAgent = require('../BaseAgent');
const logger = require('../../utils/logger');
const db = require('../../db/postgres');
const shopifyConnector = require('../../backend/shopify');

class OrderLookupAgent extends BaseAgent {
  constructor(callId, initialData = {}) {
    super(callId, initialData);
    this.requiredFields = ['order_id'];
    this.agentType = 'OrderLookupAgent';
  }

  /**
   * Execute order lookup
   */
  async execute() {
    try {
      // Check if we have required data
      if (!this.hasRequiredData()) {
        this.state = 'WAITING_FOR_INFO';
        this.requestMissingInfo();
        return;
      }

      this.state = 'RUNNING';

      logger.info('Executing order lookup', { 
        callId: this.callId,
        orderId: this.data.order_id 
      });

      // Log action to database
      const action = await db.actions.create({
        call_id: this.callId,
        action_type: 'lookup_order',
        params: { order_id: this.data.order_id },
        confidence: 0.9
      });

      // Call Shopify API (with retry logic)
      let orderData;
      try {
        orderData = await shopifyConnector.getOrder(this.data.order_id);
      } catch (error) {
        logger.error('Shopify API error', { 
          callId: this.callId,
          error: error.message 
        });

        // Update action status
        await db.actions.updateStatus(action.id, 'failed', {
          error: error.message
        });

        throw new Error('Failed to fetch order from Shopify');
      }

      if (!orderData) {
        // Order not found
        await db.actions.updateStatus(action.id, 'failed', {
          error: 'Order not found'
        });

        this.complete({
          success: false,
          message: 'Order not found',
          contextUpdate: `Order ID ${this.data.order_id} not found in system. Please verify the order number.`
        });
        return;
      }

      // Get tracking info if order is shipped
      let trackingInfo = null;
      if (orderData.fulfillment_status === 'fulfilled' || orderData.fulfillment_status === 'partial') {
        try {
          const trackingId = orderData.tracking_number;
          if (trackingId) {
            // Get tracking from Shiprocket or courier API
            trackingInfo = await this.getTrackingInfo(trackingId);
          }
        } catch (error) {
          logger.warn('Could not fetch tracking info', { 
            callId: this.callId,
            error: error.message 
          });
        }
      }

      // Update action status
      await db.actions.updateStatus(action.id, 'success', {
        order: orderData,
        tracking: trackingInfo
      });

      // Format result for AI context
      const contextUpdate = this.formatContextUpdate(orderData, trackingInfo);

      // Complete agent
      this.complete({
        success: true,
        order: orderData,
        tracking: trackingInfo,
        contextUpdate
      });

    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get tracking information
   */
  async getTrackingInfo(trackingId) {
    // This will be implemented with Shiprocket integration
    // For now, return mock data
    return {
      status: 'in_transit',
      current_location: 'Mumbai Distribution Center',
      eta: '2025-11-24T18:00:00+05:30',
      last_update: 'Package out for delivery'
    };
  }

  /**
   * Format result for AI context
   */
  formatContextUpdate(orderData, trackingInfo) {
    let context = `Order ${orderData.order_number} information:\n`;
    context += `- Status: ${this.formatStatus(orderData.fulfillment_status)}\n`;
    context += `- Payment: ${orderData.financial_status}\n`;
    context += `- Total: ₹${orderData.total_price}\n`;
    
    if (orderData.line_items && orderData.line_items.length > 0) {
      context += `- Items: ${orderData.line_items.map(item => item.name).join(', ')}\n`;
    }

    if (trackingInfo) {
      context += `\nTracking Information:\n`;
      context += `- Current Status: ${trackingInfo.status}\n`;
      context += `- Location: ${trackingInfo.current_location}\n`;
      context += `- Expected Delivery: ${this.formatETA(trackingInfo.eta)}\n`;
      context += `- Last Update: ${trackingInfo.last_update}\n`;
    }

    context += `\nTell customer this information in natural Hindi/Hinglish.`;

    return context;
  }

  /**
   * Format order status for display
   */
  formatStatus(status) {
    const statusMap = {
      'fulfilled': 'Delivered',
      'partial': 'Partially Shipped',
      'unfulfilled': 'Processing',
      'null': 'Order Placed'
    };
    return statusMap[status] || status;
  }

  /**
   * Format ETA
   */
  formatETA(eta) {
    const date = new Date(eta);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today evening';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short' 
    });
  }

  /**
   * Get prompt for missing field
   */
  getPromptForField(field) {
    if (field === 'order_id') {
      return 'Please ask user for their order number in Hindi: "Ji sir, apna order number batayiye please"';
    }
    return super.getPromptForField(field);
  }
}

module.exports = OrderLookupAgent;
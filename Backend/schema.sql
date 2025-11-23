-- Caly Database Schema for Postgres
-- Run this to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Calls table: main call records
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL,
  call_sid TEXT,
  phone_from TEXT,
  phone_to TEXT,
  start_ts TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_ts TIMESTAMP WITH TIME ZONE,
  transcript_full TEXT,
  recording_url TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Actions table: tracks all backend actions performed during calls
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  params JSONB,
  status TEXT DEFAULT 'pending', -- pending|success|failed
  result JSONB,
  confidence FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entities table: extracted information from conversations
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- order_id, phone, name, etc.
  value TEXT,
  confidence FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table: merchant/client configuration
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  shopify_store_url TEXT,
  shopify_api_key TEXT,
  shopify_api_secret TEXT,
  shiprocket_email TEXT,
  shiprocket_password TEXT,
  whatsapp_business_id TEXT,
  exotel_number TEXT,
  refund_auto_threshold INTEGER DEFAULT 2000, -- in INR
  return_window_days INTEGER DEFAULT 14,
  cancel_window_hours INTEGER DEFAULT 24,
  retention_days INTEGER DEFAULT 45,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs: track all system actions
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES calls(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  user_id TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_calls_client_id ON calls(client_id);
CREATE INDEX idx_calls_start_ts ON calls(start_ts);
CREATE INDEX idx_calls_phone_from ON calls(phone_from);
CREATE INDEX idx_actions_call_id ON actions(call_id);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_entities_call_id ON entities(call_id);
CREATE INDEX idx_entities_type ON entities(entity_type);
CREATE INDEX idx_audit_logs_call_id ON audit_logs(call_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_calls_updated_at BEFORE UPDATE ON calls
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_actions_updated_at BEFORE UPDATE ON actions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a sample client for testing
INSERT INTO clients (
  name, 
  shopify_store_url, 
  exotel_number,
  refund_auto_threshold,
  return_window_days,
  cancel_window_hours
) VALUES (
  'Test Store',
  'test-store.myshopify.com',
  '+911234567890',
  2000,
  14,
  24
);

-- Query to verify setup
SELECT 'Database schema created successfully!' as status;
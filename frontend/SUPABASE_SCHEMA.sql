-- Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_by VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  target_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, resolved, pending
  technical_analysis TEXT,
  emotional_analysis TEXT,
  total_xlm_staked NUMERIC(20,2) NOT NULL DEFAULT 0,
  supporting_xlm NUMERIC(20,2) NOT NULL DEFAULT 0,
  opposing_xlm NUMERIC(20,2) NOT NULL DEFAULT 0,
  success_rate NUMERIC(5,2) NOT NULL DEFAULT 50,
  probability NUMERIC(5,2) NOT NULL DEFAULT 50,
  odds NUMERIC(10,2) NOT NULL DEFAULT 1.5,
  result VARCHAR(20), -- yes, no, null
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Bets Table
CREATE TABLE IF NOT EXISTS bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  amount_xlm NUMERIC(20,2) NOT NULL,
  prediction VARCHAR(20) NOT NULL, -- yes, no
  placed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, won, lost
  result VARCHAR(20),
  payout_xlm NUMERIC(20,2),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY (prediction_id) REFERENCES predictions(id) ON DELETE CASCADE
);

-- Users Table (opsiyonel, profil bilgileri için)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255),
  avatar TEXT,
  xlm_balance NUMERIC(20,2) NOT NULL DEFAULT 0,
  total_bets NUMERIC(20,2) NOT NULL DEFAULT 0,
  successful_bets INTEGER NOT NULL DEFAULT 0,
  failed_bets INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_predictions_status ON predictions(status);
CREATE INDEX IF NOT EXISTS idx_predictions_category ON predictions(category);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_prediction_id ON bets(prediction_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);

-- Enable Row Level Security (RLS) for security
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
CREATE POLICY "Enable read access for all users" ON predictions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON bets FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);

-- Policies for insert/update on bets (users can insert their own bets)
CREATE POLICY "Users can insert their own bets" ON bets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert predictions" ON predictions FOR INSERT WITH CHECK (true);

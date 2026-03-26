-- =====================================================
-- Golf Charity Subscription Platform - Database Schema
-- Supabase PostgreSQL
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- Stores user account information
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- Manages user subscription plans and status
-- =====================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for subscription queries
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- =====================================================
-- CHARITIES TABLE
-- Stores charity organization information
-- =====================================================
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  contact_email VARCHAR(255),
  is_featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  total_received DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for featured charities
CREATE INDEX idx_charities_featured ON charities(is_featured);
CREATE INDEX idx_charities_status ON charities(status);

-- =====================================================
-- CHARITY_EVENTS TABLE
-- Stores upcoming charity events (e.g., golf days)
-- =====================================================
CREATE TABLE charity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  location VARCHAR(255),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for charity events
CREATE INDEX idx_charity_events_charity_id ON charity_events(charity_id);
CREATE INDEX idx_charity_events_date ON charity_events(event_date);

-- =====================================================
-- USER_CHARITIES TABLE
-- Links users to their selected charity with contribution percentage
-- =====================================================
CREATE TABLE user_charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  contribution_percentage INTEGER DEFAULT 10 CHECK (contribution_percentage >= 10 AND contribution_percentage <= 100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, charity_id)
);

-- Index for user charity lookups
CREATE INDEX idx_user_charities_user_id ON user_charities(user_id);
CREATE INDEX idx_user_charities_charity_id ON user_charities(charity_id);

-- =====================================================
-- SCORES TABLE
-- Stores user golf scores (Stableford format)
-- Maximum 5 scores per user (rolling window)
-- =====================================================
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  score_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for score queries
CREATE INDEX idx_scores_user_id ON scores(user_id);
CREATE INDEX idx_scores_date ON scores(score_date DESC);

-- =====================================================
-- DRAWS TABLE
-- Stores monthly draw configurations and results
-- =====================================================
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_month INTEGER NOT NULL CHECK (draw_month >= 1 AND draw_month <= 12),
  draw_year INTEGER NOT NULL CHECK (draw_year >= 2024),
  draw_date DATE NOT NULL, -- Computed from draw_month and draw_year
  draw_type VARCHAR(20) NOT NULL CHECK (draw_type IN ('random', 'algorithmic')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'simulated', 'published')),
  winning_numbers INTEGER[] NOT NULL, -- Array of 5 numbers
  total_pool_amount DECIMAL(12, 2) DEFAULT 0,
  jackpot_amount DECIMAL(12, 2) DEFAULT 0, -- Rolled over from previous month
  five_match_pool DECIMAL(12, 2) DEFAULT 0, -- 40%
  four_match_pool DECIMAL(12, 2) DEFAULT 0, -- 35%
  three_match_pool DECIMAL(12, 2) DEFAULT 0, -- 25%
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(draw_month, draw_year)
);

-- Index for draw queries
CREATE INDEX idx_draws_month_year ON draws(draw_year DESC, draw_month DESC);
CREATE INDEX idx_draws_status ON draws(status);

-- =====================================================
-- DRAW_PARTICIPANTS TABLE
-- Tracks user participation in each draw
-- =====================================================
CREATE TABLE draw_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_numbers INTEGER[] NOT NULL, -- User's 5 scores at time of draw
  matches_count INTEGER DEFAULT 0 CHECK (matches_count >= 0 AND matches_count <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);

-- Index for participant queries
CREATE INDEX idx_draw_participants_draw_id ON draw_participants(draw_id);
CREATE INDEX idx_draw_participants_user_id ON draw_participants(user_id);

-- =====================================================
-- WINNERS TABLE
-- Stores draw winners and prize information
-- =====================================================
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_type VARCHAR(20) NOT NULL CHECK (match_type IN ('5-match', '4-match', '3-match')),
  prize_amount DECIMAL(10, 2) NOT NULL,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  proof_image_url TEXT,
  admin_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for winner queries
CREATE INDEX idx_winners_draw_id ON winners(draw_id);
CREATE INDEX idx_winners_user_id ON winners(user_id);
CREATE INDEX idx_winners_verification_status ON winners(verification_status);
CREATE INDEX idx_winners_payment_status ON winners(payment_status);

-- =====================================================
-- CHARITY_CONTRIBUTIONS TABLE
-- Tracks all charity contributions from subscriptions
-- =====================================================
CREATE TABLE charity_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  contribution_percentage INTEGER NOT NULL,
  contribution_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for contribution queries
CREATE INDEX idx_charity_contributions_user_id ON charity_contributions(user_id);
CREATE INDEX idx_charity_contributions_charity_id ON charity_contributions(charity_id);
CREATE INDEX idx_charity_contributions_date ON charity_contributions(contribution_date DESC);

-- =====================================================
-- INDEPENDENT_DONATIONS TABLE
-- Tracks standalone donations not tied to subscriptions
-- =====================================================
CREATE TABLE independent_donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  donor_email VARCHAR(255),
  donor_name VARCHAR(255),
  message TEXT,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for donation queries
CREATE INDEX idx_independent_donations_charity_id ON independent_donations(charity_id);
CREATE INDEX idx_independent_donations_user_id ON independent_donations(user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_charities_updated_at BEFORE UPDATE ON charities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_charities_updated_at BEFORE UPDATE ON user_charities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA - Sample Charities
-- =====================================================
INSERT INTO charities (name, description, logo_url, website_url, contact_email, is_featured, status) VALUES
('Children''s Health Foundation', 'Supporting children''s healthcare and medical research to give every child a healthy start in life.', 'https://via.placeholder.com/200', 'https://example.com/childrens-health', 'contact@childrenshealth.org', TRUE, 'active'),
('Environmental Conservation Trust', 'Protecting natural habitats and wildlife for future generations through sustainable conservation efforts.', 'https://via.placeholder.com/200', 'https://example.com/eco-trust', 'info@ecotrust.org', TRUE, 'active'),
('Education for All Initiative', 'Providing quality education and learning resources to underprivileged communities worldwide.', 'https://via.placeholder.com/200', 'https://example.com/education-all', 'hello@educationforall.org', FALSE, 'active'),
('Mental Health Support Network', 'Offering mental health services, counseling, and support to those in need.', 'https://via.placeholder.com/200', 'https://example.com/mental-health', 'support@mentalhealthnetwork.org', FALSE, 'active'),
('Clean Water Project', 'Building sustainable water infrastructure in communities without access to clean drinking water.', 'https://via.placeholder.com/200', 'https://example.com/clean-water', 'info@cleanwaterproject.org', TRUE, 'active');

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Active subscribers view
CREATE VIEW active_subscribers AS
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  s.plan_type,
  s.amount,
  s.current_period_end,
  uc.charity_id,
  c.name as charity_name,
  uc.contribution_percentage
FROM users u
JOIN subscriptions s ON u.id = s.user_id
LEFT JOIN user_charities uc ON u.id = uc.user_id AND uc.is_active = TRUE
LEFT JOIN charities c ON uc.charity_id = c.id
WHERE s.status = 'active' AND u.status = 'active';

-- User scores summary view
CREATE VIEW user_scores_summary AS
SELECT 
  user_id,
  COUNT(*) as total_scores,
  ARRAY_AGG(score ORDER BY score_date DESC) as scores,
  ARRAY_AGG(score_date ORDER BY score_date DESC) as dates
FROM scores
GROUP BY user_id;

-- Monthly draw statistics view
CREATE VIEW draw_statistics AS
SELECT 
  d.id as draw_id,
  d.draw_month,
  d.draw_year,
  d.status,
  d.total_pool_amount,
  COUNT(DISTINCT dp.user_id) as total_participants,
  COUNT(DISTINCT CASE WHEN w.match_type = '5-match' THEN w.user_id END) as five_match_winners,
  COUNT(DISTINCT CASE WHEN w.match_type = '4-match' THEN w.user_id END) as four_match_winners,
  COUNT(DISTINCT CASE WHEN w.match_type = '3-match' THEN w.user_id END) as three_match_winners
FROM draws d
LEFT JOIN draw_participants dp ON d.id = dp.draw_id
LEFT JOIN winners w ON d.id = w.draw_id
GROUP BY d.id;

-- Charity contribution summary view
CREATE VIEW charity_contribution_summary AS
SELECT 
  c.id as charity_id,
  c.name as charity_name,
  COUNT(DISTINCT cc.user_id) as total_contributors,
  SUM(cc.amount) as total_from_subscriptions,
  COALESCE(SUM(id_donations.amount), 0) as total_from_donations,
  SUM(cc.amount) + COALESCE(SUM(id_donations.amount), 0) as total_received
FROM charities c
LEFT JOIN charity_contributions cc ON c.id = cc.charity_id
LEFT JOIN (
  SELECT charity_id, SUM(amount) as amount
  FROM independent_donations
  WHERE status = 'completed'
  GROUP BY charity_id
) id_donations ON c.id = id_donations.charity_id
GROUP BY c.id, c.name;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all tables for additional security
-- =====================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid()::uuid = id);

-- Users can update their own profile
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid()::uuid = id);

-- Users can read their own subscriptions
CREATE POLICY subscriptions_select_own ON subscriptions
  FOR SELECT USING (auth.uid()::uuid = user_id);

-- Users can read/write their own scores
CREATE POLICY scores_select_own ON scores
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY scores_insert_own ON scores
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY scores_delete_own ON scores
  FOR DELETE USING (auth.uid()::uuid = user_id);

-- Users can read/write their charity selections
CREATE POLICY user_charities_select_own ON user_charities
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY user_charities_insert_own ON user_charities
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY user_charities_update_own ON user_charities
  FOR UPDATE USING (auth.uid()::uuid = user_id);

-- Users can read their own winnings
CREATE POLICY winners_select_own ON winners
  FOR SELECT USING (auth.uid()::uuid = user_id);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE users IS 'Stores user account information and authentication details';
COMMENT ON TABLE subscriptions IS 'Manages subscription plans, billing cycles, and Stripe integration';
COMMENT ON TABLE charities IS 'Directory of charitable organizations available for user selection';
COMMENT ON TABLE scores IS 'Golf scores in Stableford format (1-45), maximum 5 per user';
COMMENT ON TABLE draws IS 'Monthly draw configurations with winning numbers and prize pools';
COMMENT ON TABLE winners IS 'Draw winners with verification and payment tracking';
COMMENT ON TABLE charity_contributions IS 'Automatic contributions from subscription fees';
COMMENT ON TABLE independent_donations IS 'Standalone donations not tied to subscriptions';

-- =====================================================
-- END OF SCHEMA
-- =====================================================

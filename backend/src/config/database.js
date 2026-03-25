/**
 * Database Configuration
 * Supabase PostgreSQL connection setup
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Validate required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

// Create Supabase client for general operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Create Supabase admin client for privileged operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

module.exports = {
  supabase,
  supabaseAdmin
};

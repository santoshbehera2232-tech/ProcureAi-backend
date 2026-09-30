import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  JWT_SECRET: process.env.JWT_SECRET || 'procureai_enterprise_super_secret_jwt_key_2026_x99!',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'procureai_enterprise_refresh_token_secret_key_2026_z88!',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  AI_API_KEY: process.env.AI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'gpt-4o-mini'
};

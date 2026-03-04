-- Finance Tracker: transactions table
-- Run this in Supabase SQL Editor to create the schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by user and date
CREATE INDEX IF NOT EXISTS idx_transactions_user_created 
  ON public.transactions (user_id, created_at DESC);

-- Row Level Security: users can only see their own data
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Session pilih kategori per chat Telegram (untuk tombol kategori)
CREATE TABLE IF NOT EXISTS public.telegram_category_session (
  chat_id BIGINT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.telegram_category_session IS 'Stores selected category per Telegram chat for button flow';

-- Multi-user: link Telegram chat_id ke user_id (Supabase Auth)
CREATE TABLE IF NOT EXISTS public.telegram_links (
  chat_id BIGINT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.telegram_link_codes (
  code TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_telegram_link_codes_expires ON public.telegram_link_codes (expires_at);

COMMENT ON TABLE public.telegram_links IS 'Maps Telegram chat_id to Supabase user_id';
COMMENT ON TABLE public.telegram_link_codes IS 'One-time codes for linking Telegram to web account';

COMMENT ON TABLE public.transactions IS 'Stores income/expense transactions from web dashboard and Telegram bot';

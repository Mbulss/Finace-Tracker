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

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- For Telegram bot: we use telegram_user_id as user_id when no web auth.
-- Optional: create a mapping table later (telegram_chat_id -> user_id) if you link Telegram to Supabase Auth.
-- For MVP, use a single "telegram" user or pass user_id from env for bot-only usage.
COMMENT ON TABLE public.transactions IS 'Stores income/expense transactions from web dashboard and Telegram bot';

-- Create user_integrations table to store OAuth refresh tokens
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_integrations_user ON public.user_integrations (user_id);

-- Enable RLS
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

-- Allow user reads (adminClient handles writes)
CREATE POLICY "Users can only see their own integrations"
  ON public.user_integrations FOR SELECT
  USING (auth.uid()::text = user_id::text);

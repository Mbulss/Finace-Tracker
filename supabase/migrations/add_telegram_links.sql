-- Satu chat Telegram terhubung ke satu user (Supabase Auth).
CREATE TABLE IF NOT EXISTS public.telegram_links (
  chat_id BIGINT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Kode one-time untuk menghubungkan: user buat kode di web, kirim /link KODE ke bot.
CREATE TABLE IF NOT EXISTS public.telegram_link_codes (
  code TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_telegram_link_codes_expires ON public.telegram_link_codes (expires_at);

COMMENT ON TABLE public.telegram_links IS 'Maps Telegram chat_id to Supabase user_id for multi-user bot';
COMMENT ON TABLE public.telegram_link_codes IS 'One-time codes for linking Telegram to web account';

-- Jalankan ini saja di Supabase SQL Editor kalau tabel transactions sudah ada.
-- Untuk fitur tombol kategori di bot Telegram.

CREATE TABLE IF NOT EXISTS public.telegram_category_session (
  chat_id BIGINT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.telegram_category_session IS 'Stores selected category per Telegram chat for button flow';

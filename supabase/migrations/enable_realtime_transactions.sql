-- Enable Supabase Realtime untuk tabel transactions
-- Data dari Telegram (atau dari web) akan otomatis muncul di dashboard tanpa refresh.
-- Jalankan sekali di Supabase: SQL Editor → paste & run.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  END IF;
END $$;

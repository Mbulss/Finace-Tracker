# Tes Bot Telegram di Local (pakai ngrok)

## Persiapan

1. **Isi `.env.local`** — pastikan sudah ada:
   - `TELEGRAM_BOT_TOKEN` (dari @BotFather)
   - `TELEGRAM_USER_ID` (UUID user dari Supabase → Authentication → Users)

2. **Install ngrok** (sekali saja):
   - Daftar gratis: https://ngrok.com → sign up
   - Download: https://ngrok.com/download (pilih Windows)
   - Extract, lalu tambahkan folder ngrok ke PATH, atau jalankan dari folder tersebut
   - Login (sekali): buka terminal, jalankan `ngrok config add-authtoken TOKEN_KAMU` — token ada di https://dashboard.ngrok.com/get-started/your-authtoken

3. **Jalankan 2 terminal.**

---

## Terminal 1: Jalankan app

```bash
npm run dev
```

Biarkan jalan. App ada di http://localhost:3000.

---

## Terminal 2: Jalankan ngrok

```bash
ngrok http 3000
```

Akan muncul URL **Forwarding** seperti: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`

**Copy URL itu** (yang https, tanpa path). Tidak perlu buka di browser atau isi password — langsung dipakai untuk webhook.

---

## Set webhook

Di **PowerShell**, ganti `TUNNEL_URL` dengan URL ngrok kamu (contoh: `https://abc123.ngrok-free.app`):

```powershell
Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/botBOT_TOKEN_KAMU/setWebhook?url=TUNNEL_URL/api/telegram/webhook"
```

Contoh (ganti token dan URL ngrok):
```powershell
Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot123456789:AAHxxx.../setWebhook?url=https://abc123.ngrok-free.app/api/telegram/webhook"
```

Kalau sukses, muncul `ok : True`, `result : True`.

---

## Tes

1. Buka Telegram, cari bot kamu, kirim **Start**.
2. Kirim contoh:
   ```
   -25000 kopi
   +500000 gaji
   ```
3. Bot harus balas: **Transaction saved successfully 💰**
4. Cek dashboard web (login) → transaksi muncul di daftar.

---

## Hapus webhook (kalau selesai tes local)

Supaya nanti bisa set webhook ke production:

**PowerShell:**
```powershell
Invoke-RestMethod -Method Get -Uri "https://api.telegram.org/botBOT_TOKEN_KAMU/deleteWebhook"
```

Setelah deploy ke Vercel, set lagi webhook ke URL production.

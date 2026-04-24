# Automaton AI Voice Order Confirmation System

## Setup

### 1. Supabase
- Create a project at supabase.com
- Run `supabase_schema.sql` in the SQL editor
- Copy your project URL and anon key

### 2. Backend
```bash
cd backend
cp .env.example .env
# Fill in all values in .env
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Expose backend with ngrok (required for Twilio webhooks)
```bash
ngrok http 8000
# Copy the https URL into CALLBACK_URL in backend/.env
```

### 4. Twilio
- Buy a phone number at twilio.com
- No manual webhook config needed — the backend sets it dynamically per call

### 5. Gemini
- Get API key from aistudio.google.com
- Set `GEMINI_API_KEY` in .env

### 7. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Call Flow
1. Fill form → Create Order
2. Click "Call Customer" → Twilio calls the number
3. Customer hears order details in their language
4. Press 1 (confirm) or 2 (cancel)
5. Dashboard updates in real time

## .env Reference (backend)
| Key | Description |
|-----|-------------|
| TWILIO_SID | Twilio Account SID |
| TWILIO_AUTH_TOKEN | Twilio Auth Token |
| TWILIO_PHONE_NUMBER | Your Twilio number (+1...) |
| GEMINI_API_KEY | Gemini API key |
| SUPABASE_URL | Supabase project URL |
| SUPABASE_KEY | Supabase anon key |
| CALLBACK_URL | Your ngrok HTTPS URL |

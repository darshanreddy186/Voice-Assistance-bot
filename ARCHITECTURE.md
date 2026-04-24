# Automaton AI Voice Order Confirmation System - Architecture

## System Overview
Full-stack multilingual voice assistant for automated order confirmation via phone calls.

---

## Architecture Layers

### 1. PRESENTATION LAYER (Frontend)
**Technology:** React + Vite

**Components:**
- `OrderForm.jsx` - Form to create orders and initiate calls
- `Dashboard.jsx` - Real-time order status and call logs display
- `App.jsx` - Main application with tab navigation

**Features:**
- Language selection (English, Hindi, Kannada, Marathi)
- Order creation form
- Call initiation button
- Real-time status dashboard with statistics
- Responsive UI with dark theme

**Communication:**
- REST API calls to FastAPI backend
- Environment variable: `VITE_API_URL`

---

### 2. APPLICATION LAYER (Backend)
**Technology:** FastAPI (Python)

**Main Components:**

#### A. API Routes (`routes/orders.py`)
**Endpoints:**
- `POST /create-order` - Creates new order in database
- `POST /initiate-call` - Triggers Twilio call to customer
- `POST /voice` - Twilio webhook for call initiation (generates TwiML)
- `POST /process-response` - Handles customer keypad/voice input
- `GET /orders` - Fetches all orders for dashboard
- `GET /audio/{filename}` - Serves generated audio files

#### B. Service Layer

**1. Supabase Handler (`services/supabase_handler.py`)**
- Database operations (CRUD)
- Functions:
  - `create_order()` - Insert new order
  - `get_all_orders()` - Fetch all orders
  - `get_order_by_id()` - Fetch single order
  - `update_order_status()` - Update order status (pending/confirmed/cancelled)

**2. Twilio Handler (`services/twilio_handler.py`)**
- Telephony operations
- Functions:
  - `initiate_call()` - Makes outbound call via Twilio API
  - `generate_voice_response()` - Creates TwiML XML response
    - Uses `<Say>` for English/Hindi (Polly voices)
    - Uses `<Play>` for Kannada/Marathi (gTTS audio files)
    - Implements `<Gather>` for keypad input

**3. TTS Handler (`services/tts_handler.py`)**
- Text-to-Speech configuration
- Language-specific message templates
- Voice configuration:
  - English: Polly.Joanna
  - Hindi: Polly.Aditi
  - Kannada: gTTS (native script)
  - Marathi: gTTS (native script)

**4. Audio Generator (`services/audio_generator.py`)**
- Generates MP3 files using gTTS for Kannada/Marathi
- Stores files in `audio_files/` directory
- Returns public URLs for Twilio to play

**5. AI Handler (`services/ai_handler.py`)**
- Intent classification using Gemini API
- Classifies user responses into:
  - CONFIRM
  - CANCEL
  - UNCLEAR
- Fallback for speech input (primary is keypad)

---

### 3. INTEGRATION LAYER (External Services)

#### A. Twilio (Telephony)
**Service:** Twilio Programmable Voice API
**Purpose:** Make and manage phone calls
**Features Used:**
- Outbound calling
- TwiML webhooks
- DTMF (keypad) input via `<Gather>`
- Voice synthesis via Amazon Polly
- Audio playback via `<Play>`

**Flow:**
1. Backend calls Twilio API to initiate call
2. Twilio calls customer
3. Twilio hits `/voice` webhook
4. Backend returns TwiML instructions
5. Customer presses 1 or 2
6. Twilio hits `/process-response` webhook
7. Backend updates database

#### B. Google Gemini (AI)
**Service:** Gemini 1.5 Flash API
**Purpose:** Natural language understanding
**Usage:**
- Classifies user speech input
- Handles ambiguous responses
- Fallback when keypad not used

#### C. gTTS (Text-to-Speech)
**Service:** Google Text-to-Speech (Free Python Library)
**Purpose:** Generate audio for Kannada and Marathi
**Languages Supported:**
- `kn` - Kannada
- `mr` - Marathi
**Output:** MP3 files served via FastAPI

#### D. Supabase (Database)
**Service:** Supabase PostgreSQL
**Purpose:** Persistent data storage

**Schema:**
```sql
orders (
  id UUID PRIMARY KEY,
  customer_name TEXT,
  phone TEXT,
  order_details TEXT,
  language TEXT,
  status TEXT (pending/confirmed/cancelled),
  created_at TIMESTAMPTZ
)
```

---

### 4. INFRASTRUCTURE LAYER

#### A. Ngrok
**Purpose:** Expose local backend to internet
**Why:** Twilio webhooks require public HTTPS URL
**Usage:** `ngrok http 8000`

#### B. Environment Variables
**Backend (.env):**
- `TWILIO_SID` - Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Twilio phone number
- `GEMINI_API_KEY` - Google Gemini API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon key
- `CALLBACK_URL` - Ngrok public URL

**Frontend (.env):**
- `VITE_API_URL` - Backend API URL

---

## Call Flow Sequence

```
1. User fills form → Frontend
2. POST /create-order → Backend → Supabase (order stored)
3. User clicks "Call Customer" → Frontend
4. POST /initiate-call → Backend → Twilio API
5. Twilio makes outbound call → Customer's phone
6. Twilio webhook → POST /voice → Backend
7. Backend generates TwiML:
   - English/Hindi: <Say> with Polly voice
   - Kannada/Marathi: Generate MP3 → <Play> audio URL
8. Customer hears message in their language
9. Customer presses 1 (confirm) or 2 (cancel)
10. Twilio webhook → POST /process-response → Backend
11. Backend classifies intent (1=CONFIRM, 2=CANCEL)
12. Backend updates order status → Supabase
13. Backend returns TwiML with confirmation message
14. Customer hears confirmation → Call ends
15. Dashboard auto-refreshes → Shows updated status
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | User interface |
| Backend | FastAPI | REST API server |
| Database | Supabase (PostgreSQL) | Data persistence |
| Telephony | Twilio | Phone calls |
| TTS (EN/HI) | Amazon Polly (via Twilio) | Voice synthesis |
| TTS (KN/MR) | gTTS | Audio generation |
| AI | Google Gemini | Intent classification |
| Tunneling | Ngrok | Webhook exposure |
| Language | Python 3.10+ | Backend runtime |
| Language | JavaScript (ES6+) | Frontend runtime |

---

## Multilingual Support

| Language | Code | Voice/TTS | Method |
|----------|------|-----------|--------|
| English | en-US | Polly.Joanna | Twilio `<Say>` |
| Hindi | hi-IN | Polly.Aditi | Twilio `<Say>` |
| Kannada | kn-IN | gTTS (kn) | Generate MP3 → `<Play>` |
| Marathi | mr-IN | gTTS (mr) | Generate MP3 → `<Play>` |

---

## Security Considerations

1. **API Keys:** Stored in `.env` files (not committed to git)
2. **CORS:** Enabled for frontend-backend communication
3. **Supabase RLS:** Row Level Security enabled (optional)
4. **Webhook Validation:** Twilio signatures can be validated (not implemented in MVP)
5. **HTTPS:** Required for Twilio webhooks (via ngrok)

---

## Scalability Notes

**Current Limitations:**
- Audio files stored locally (not cloud storage)
- Ngrok URL changes on restart (use paid plan for static domain)
- Single server instance

**Production Improvements:**
- Use AWS S3/Cloudinary for audio file storage
- Deploy backend to cloud (AWS/GCP/Azure)
- Use static domain instead of ngrok
- Add Redis for caching
- Implement webhook signature validation
- Add call recording
- Add retry logic for failed calls
- Add analytics and monitoring

---

## File Structure

```
automaton-voice/
├── backend/
│   ├── main.py                    # FastAPI app entry
│   ├── routes/
│   │   └── orders.py              # API endpoints
│   ├── services/
│   │   ├── supabase_handler.py    # Database operations
│   │   ├── twilio_handler.py      # Telephony logic
│   │   ├── tts_handler.py         # TTS configuration
│   │   ├── audio_generator.py     # gTTS audio generation
│   │   └── ai_handler.py          # Gemini AI integration
│   ├── audio_files/               # Generated MP3 files
│   ├── requirements.txt           # Python dependencies
│   └── .env                       # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── OrderForm.jsx      # Order creation form
│   │   │   └── Dashboard.jsx      # Status dashboard
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Global styles
│   ├── index.html                 # HTML template
│   ├── package.json               # Node dependencies
│   └── .env                       # Frontend env vars
├── supabase_schema.sql            # Database schema
├── README.md                      # Setup instructions
└── ARCHITECTURE.md                # This file
```

---

## Cost Breakdown (Approximate)

| Service | Free Tier | Cost After Free Tier |
|---------|-----------|---------------------|
| Twilio | $15 trial credit | ~$0.01-0.02 per minute |
| Supabase | 500MB database, 2GB bandwidth | $25/month (Pro) |
| Gemini API | Free tier available | Pay per token |
| gTTS | Completely free | Free |
| Ngrok | Free (random URLs) | $8/month (static domain) |

**MVP Cost:** ~$0 (using free tiers)
**Production Cost:** ~$50-100/month (depending on call volume)

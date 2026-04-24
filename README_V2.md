# 🤖 Automaton AI - Advanced Voice Order Confirmation System

> An AI-powered autonomous order management agent with multi-turn conversational capabilities, smart retry logic, and real-time modifications.

## 🌟 Key Features

### 🎯 Core Capabilities
- **User Authentication** - Signup/Login system with profile management
- **Shopping Cart** - Full e-commerce cart functionality
- **Auto-Call Trigger** - Automated call 30 seconds after order placement
- **Multi-Turn AI Conversation** - Natural dialogue, not IVR button pressing
- **Speech-to-Text** - Real voice input processing
- **Auto Language Detection** - Detects and responds in user's language
- **Context-Aware Modifications** - AI understands and processes order changes
- **Smart Retry System** - Intelligent call retry logic for no-answer/busy
- **Admin Dashboard** - Complete order tracking and AI interaction monitoring

### 🚀 What Makes This Special

#### 1. Real Conversation (Not IVR)
```
❌ Traditional IVR:
"Press 1 to confirm, Press 2 to cancel"

✅ Automaton AI:
Bot: "Hi John, do you want to confirm your order?"
User: "Yes, but deliver tomorrow evening"
Bot: "Sure, I've scheduled it for tomorrow evening. Anything else?"
```

#### 2. Context-Aware Intelligence
```
User: "Change delivery to tomorrow"
→ AI extracts: delivery_time = "tomorrow"
→ Updates database automatically
→ Confirms with user
→ Tracks modification in admin panel
```

#### 3. Multi-Turn Conversations
```
Turn 1:
Bot: "Confirm your order?"
User: "Yes but change time"

Turn 2:
Bot: "What time works for you?"
User: "Evening"

Turn 3:
Bot: "Evening delivery scheduled. Confirmed?"
User: "Yes"
```

#### 4. Smart Retry Logic
- **No Answer** → Retry after 1 minute
- **Busy** → Retry after 2 minutes
- **Max 3 attempts** → All logged and tracked
- **Status tracking** → Visible in admin dashboard

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React + Vite | User interface & admin dashboard |
| **Backend** | FastAPI (Python) | REST API & business logic |
| **Database** | Supabase (PostgreSQL) | Data persistence |
| **Telephony** | Twilio | Voice calls & webhooks |
| **AI Brain** | Google Gemini 1.5 | Intent classification & NLU |
| **TTS (EN/HI)** | Amazon Polly (via Twilio) | Voice synthesis |
| **TTS (KN/MR)** | gTTS | Kannada & Marathi audio |
| **Tunneling** | Ngrok | Webhook exposure |

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER PORTAL                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Products │  │   Cart   │  │  Orders  │  │  Login   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────────┐
│                     FASTAPI BACKEND                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes: /signup /login /products /cart /place-order │  │
│  │          /voice /process-speech /call-status         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services:                                           │  │
│  │  • db_handler.py - Database operations              │  │
│  │  • ai_handler_v2.py - Gemini AI processing          │  │
│  │  • twilio_handler_v2.py - Call management           │  │
│  │  • call_scheduler.py - Auto-call & retry logic      │  │
│  │  • audio_generator.py - gTTS audio generation       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────┬──────────┬──────────┬──────────┬────────────────────┘
      │          │          │          │
      ▼          ▼          ▼          ▼
┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Supabase │ │ Twilio │ │ Gemini │ │  gTTS  │
│ Database │ │ Calls  │ │   AI   │ │ Audio  │
└──────────┘ └────────┘ └────────┘ └────────┘
```

---

## 🗄️ Database Schema

### Tables:
1. **users** - User accounts (name, phone, address)
2. **products** - Product catalog
3. **cart** - Shopping cart items
4. **orders** - Order records
5. **order_items** - Order line items
6. **call_logs** - Call attempt tracking
7. **order_modifications** - AI-made changes
8. **conversation_history** - Multi-turn dialogue tracking

---

## 🔄 Complete Flow

### 1. User Journey
```
Sign Up → Browse Products → Add to Cart → Place Order
    ↓
Wait 30 seconds
    ↓
Receive AI Call → Have Conversation → Order Confirmed/Modified
    ↓
View Order Status in Dashboard
```

### 2. Call Flow (Detailed)
```
1. Order placed → Stored in DB
2. Backend schedules call (30s delay)
3. Twilio initiates call
4. Customer answers
5. Twilio hits /voice webhook
6. Backend generates greeting TwiML
7. Customer hears message in their language
8. Customer speaks response
9. Twilio captures speech → hits /process-speech
10. Backend sends to Gemini AI
11. AI classifies intent + extracts modifications
12. Backend updates database
13. Backend generates response
14. If conversation continues → repeat 7-13
15. If conversation ends → call terminates
16. Status updated in admin dashboard
```

### 3. Retry Logic
```
Call Status: NO-ANSWER
    ↓
Log attempt #1
    ↓
Schedule retry in 1 minute
    ↓
Retry call (attempt #2)
    ↓
If still no answer → retry in 1 minute (attempt #3)
    ↓
Max attempts reached → Stop
```

---

## 🎨 Frontend Components

### User Portal
- **Login.jsx** - Authentication
- **ProductList.jsx** - Product catalog
- **Cart.jsx** - Shopping cart & checkout
- **MyOrders.jsx** - Order history

### Admin Dashboard
- **AdminDashboard.jsx** - Complete monitoring
  - Order statistics
  - Order list with real-time updates
  - Detailed order view
  - Call logs
  - AI conversation history
  - Modification tracking

---

## 🌍 Multilingual Support

| Language | Code | Voice | Method |
|----------|------|-------|--------|
| English | en-US | Polly.Joanna | Twilio `<Say>` |
| Hindi | hi-IN | Polly.Aditi | Twilio `<Say>` |
| Kannada | kn-IN | gTTS | Generate MP3 → `<Play>` |
| Marathi | mr-IN | gTTS | Generate MP3 → `<Play>` |

---

## 🎯 AI Capabilities

### Intent Classification
- **CONFIRM** - User agrees to order
- **CANCEL** - User wants to cancel
- **MODIFY** - User wants changes
- **QUERY** - User has questions

### Modification Extraction
```json
{
  "intent": "modify",
  "modifications": {
    "delivery_time": "tomorrow evening",
    "address": "new address",
    "items": "add 1 more item"
  },
  "detected_language": "en",
  "response_text": "Sure, I've updated delivery to tomorrow evening.",
  "continue_conversation": true
}
```

---

## 📈 Admin Dashboard Features

### Real-Time Monitoring
- Live order statistics
- Auto-refresh every 5 seconds
- Status breakdown (pending/confirmed/cancelled/modified)

### Order Details View
- Customer information
- Order items with quantities
- Delivery date/time
- Total amount
- Call attempt logs
- AI conversation transcript
- Modification history

### Call Logs
- Attempt number
- Status (initiated/completed/no-answer/busy/failed)
- Duration
- Timestamp

### Conversation History
- Turn-by-turn dialogue
- User input (with detected language)
- AI intent classification
- AI response

### Modification Tracking
- Type (delivery_time/address/items)
- Old value → New value
- User input that triggered change
- AI response
- Timestamp

---

## 🔒 Security Features

- Environment variable protection
- CORS configuration
- Row Level Security (Supabase)
- Phone number verification (Twilio)
- HTTPS webhooks (ngrok/production)

---

## 📦 File Structure

```
automaton-voice-v2/
├── backend/
│   ├── main.py                      # FastAPI app
│   ├── routes/
│   │   └── api.py                   # All API endpoints
│   ├── services/
│   │   ├── db_handler.py            # Database operations
│   │   ├── ai_handler_v2.py         # Gemini AI processing
│   │   ├── twilio_handler_v2.py     # Call management
│   │   ├── call_scheduler.py        # Auto-call & retry
│   │   ├── audio_generator.py       # gTTS audio
│   │   └── tts_handler.py           # TTS config
│   ├── audio_files/                 # Generated audio
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── UserPortal.jsx
│   │   │   ├── ProductList.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── MyOrders.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
├── supabase_schema_v2.sql
├── SETUP_GUIDE.md
├── ARCHITECTURE.md
└── README_V2.md (this file)
```

---

## 🚀 Quick Start

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.

### TL;DR
```bash
# 1. Setup Supabase (run supabase_schema_v2.sql)

# 2. Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
uvicorn main:app --reload --port 8000

# 3. Ngrok (new terminal)
ngrok http 8000
# Copy URL to backend/.env CALLBACK_URL

# 4. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev

# 5. Open http://localhost:5173
```

---

## 🎓 Demo Script

### For Judges/Stakeholders:

**1. Show User Flow (2 min)**
- Sign up → Add products → Place order
- "Notice the 30-second auto-call feature"

**2. Demonstrate AI Call (3 min)**
- Receive call → Have natural conversation
- Show modification: "Deliver tomorrow evening"
- AI understands and updates order

**3. Admin Dashboard (2 min)**
- Show real-time statistics
- Click order → Show conversation history
- Highlight AI modifications tracking

**4. Highlight Unique Features (1 min)**
- "This is NOT IVR - it's real AI conversation"
- "Multi-turn dialogue with context"
- "Auto language detection"
- "Smart retry system"

---

## 💡 Future Enhancements

- [ ] Voice biometrics for authentication
- [ ] Sentiment analysis during calls
- [ ] Predictive delivery time suggestions
- [ ] Multi-language mixing in single call
- [ ] Call recording & playback
- [ ] Analytics dashboard with charts
- [ ] WhatsApp integration
- [ ] Email notifications
- [ ] SMS confirmations
- [ ] Payment integration

---

## 📊 Performance Metrics

- **Call Success Rate**: Track completion vs failures
- **Modification Rate**: % of orders modified via AI
- **Language Distribution**: Usage by language
- **Retry Effectiveness**: Success rate by attempt
- **Conversation Length**: Average turns per call
- **Response Time**: AI processing latency

---

## 🏆 Competitive Advantages

1. **Real Conversation** - Not button-based IVR
2. **Context Awareness** - Remembers conversation history
3. **Dynamic Modifications** - Changes orders on the fly
4. **Multi-Language** - 4 languages with auto-detection
5. **Smart Retry** - Intelligent call scheduling
6. **Complete Tracking** - Every interaction logged
7. **Admin Insights** - Full visibility into AI behavior

---

## 📞 Support & Contact

For issues or questions:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Check backend logs
4. Verify Twilio console logs

---

## 📄 License

MIT License - Feel free to use for learning and commercial projects

---

**Built with ❤️ by the Automaton AI Team**

*Transforming order confirmation from robotic IVR to intelligent conversation*

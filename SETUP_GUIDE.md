# 🚀 Complete Setup Guide - Automaton AI Voice System v2

## 🎯 What You're Building

An AI-powered autonomous order management system with:
- ✅ User authentication & shopping cart
- ✅ Auto-call after order (30 seconds)
- ✅ Multi-turn conversational AI (NOT IVR)
- ✅ Speech-to-text input
- ✅ Auto language detection
- ✅ Context-aware modifications (time, address, items)
- ✅ Smart retry system (no-answer, busy)
- ✅ Admin dashboard with full tracking

---

## 📋 Prerequisites

1. **Python 3.10+** installed
2. **Node.js 16+** and npm installed
3. **Accounts created:**
   - Supabase (free tier)
   - Twilio (trial account)
   - Google AI Studio (Gemini API - free)

---

## 🗄️ Step 1: Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (2-3 minutes)
3. Go to **SQL Editor** in the left sidebar
4. Copy the entire content of `supabase_schema_v2.sql`
5. Paste and click **Run**
6. Verify tables created: users, products, orders, order_items, cart, call_logs, order_modifications, conversation_history
7. Go to **Settings** → **API** and copy:
   - Project URL
   - anon/public key

---

## 🔧 Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2.2 Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
# Twilio (get from twilio.com/console)
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# Gemini (get from aistudio.google.com)
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase (from step 1)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Ngrok (will update in step 3)
CALLBACK_URL=https://your-ngrok-url.ngrok-free.app
```

### 2.3 Start Backend

```bash
uvicorn main:app --reload --port 8000
```

Keep this terminal open!

---

## 🌐 Step 3: Expose Backend (Ngrok)

In a NEW terminal:

```bash
ngrok http 8000
```

You'll see output like:
```
Forwarding  https://abc123-xyz.ngrok-free.app -> http://localhost:8000
```

**IMPORTANT:**
1. Copy the `https://...ngrok-free.app` URL
2. Update `CALLBACK_URL` in `backend/.env`
3. Restart your backend (Ctrl+C and run `uvicorn main:app --reload --port 8000` again)

Keep ngrok running!

---

## 🎨 Step 4: Frontend Setup

In a NEW terminal:

```bash
cd frontend
npm install
```

Create `.env`:

```bash
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Start frontend:

```bash
npm run dev
```

Open browser: http://localhost:5173

---

## 📞 Step 5: Twilio Setup

1. Go to [twilio.com/console](https://console.twilio.com)
2. Get a phone number (if you don't have one):
   - Phone Numbers → Manage → Buy a number
   - Choose any number with Voice capability
3. **Verify your test phone number:**
   - Phone Numbers → Manage → Verified Caller IDs
   - Click "Add a new Caller ID"
   - Enter YOUR phone number (the one you'll test with)
   - Complete verification (you'll get a call/SMS)

**Note:** Twilio trial accounts can only call verified numbers. Verify all test numbers!

---

## 🧪 Step 6: Test the System

### 6.1 User Flow Test

1. Open http://localhost:5173
2. Click "Sign Up"
3. Fill in:
   - First Name: John
   - Last Name: Doe
   - Phone: +919876543210 (use YOUR verified number)
   - Address: 123 Main St
4. Click "Sign Up" → You're logged in!
5. Browse products → Add 2-3 items to cart
6. Go to Cart tab
7. Select delivery date/time and language
8. Click "Place Order"
9. **Wait 30 seconds** → You'll receive a call!

### 6.2 Call Flow Test

When you receive the call:

**English:**
- Bot: "Hi John, this is about your order of 2 items. Do you want to confirm this order?"
- You: "Yes, but deliver tomorrow evening"
- Bot: "Sure, I've scheduled delivery for tomorrow evening. Is that okay?"
- You: "Yes"
- Bot: "Great! Your order is confirmed. Thank you!"

**Hindi:**
- Bot: "नमस्ते John, यह आपके 2 items के ऑर्डर के बारे में है। क्या आप इस ऑर्डर की पुष्टि करना चाहते हैं?"
- You: "हाँ, लेकिन शाम को डिलीवर करें"
- Bot: (responds in Hindi with confirmation)

**Kannada/Marathi:** Same conversational flow in respective languages

### 6.3 Admin Dashboard Test

1. In the app, click "Admin Mode" button (top right)
2. You'll see:
   - Statistics (total, pending, confirmed, etc.)
   - All orders list
3. Click on any order to see:
   - Order details
   - Call logs (attempts, status, duration)
   - AI conversation history (multi-turn)
   - Modifications made by AI

---

## 🎯 Key Features to Demo

### 1. Multi-Turn Conversation
```
User: "Yes but deliver tomorrow"
Bot: "Sure, tomorrow. What time?"
User: "Evening"
Bot: "Okay, tomorrow evening. Confirmed?"
User: "Yes"
```

### 2. Auto Language Detection
- User speaks Hindi → Bot responds in Hindi automatically
- No need to pre-select language in call

### 3. Context-Aware Modifications
```
User: "Change delivery to tomorrow evening"
→ AI extracts: delivery_time = "tomorrow evening"
→ Updates database
→ Shows in admin dashboard under "Modifications"
```

### 4. Smart Retry System
- No answer → Retry after 1 minute
- Busy → Retry after 2 minutes
- Max 3 attempts
- All logged in admin dashboard

---

## 🐛 Troubleshooting

### Issue: "Order not found" on call
**Solution:** Check backend logs. Ensure ngrok URL in `.env` is correct and backend restarted.

### Issue: No call received
**Solution:**
1. Check Twilio console → Monitor → Logs → Calls
2. Verify phone number is verified in Twilio
3. Check ngrok is running
4. Verify CALLBACK_URL in .env matches ngrok URL

### Issue: "Application error" on call
**Solution:**
1. Check backend terminal for errors
2. Verify all environment variables are set
3. Check Twilio webhook logs for error details

### Issue: Speech not recognized
**Solution:**
- Speak clearly and slowly
- Use keypad as fallback (1 = confirm, 2 = cancel)
- Check Gemini API key is valid

### Issue: Kannada/Marathi not working
**Solution:**
1. Ensure `gtts` is installed: `pip install gtts`
2. Check `audio_files/` directory is created
3. Verify ngrok URL is accessible

---

## 🚀 Production Deployment Checklist

- [ ] Deploy backend to cloud (AWS/GCP/Azure/Railway)
- [ ] Use static domain instead of ngrok
- [ ] Store audio files in S3/Cloudinary
- [ ] Add webhook signature validation
- [ ] Implement proper authentication (JWT)
- [ ] Add rate limiting
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Configure CORS properly
- [ ] Add call recording
- [ ] Implement background job queue (Celery/Bull)
- [ ] Add analytics dashboard
- [ ] Set up CI/CD pipeline

---

## 📊 Architecture Overview

```
User → Frontend (React)
         ↓
    Backend (FastAPI)
         ↓
    ┌────┴────┬─────────┬──────────┐
    ↓         ↓         ↓          ↓
Supabase  Twilio   Gemini AI    gTTS
(Database) (Calls)  (AI Brain)  (Voice)
```

---

## 🎓 What Makes This Special

### vs Traditional IVR:
❌ IVR: "Press 1 to confirm, 2 to cancel"
✅ This: "Do you want to confirm?" → Natural conversation

### vs Basic Voice Bots:
❌ Basic: Single turn, no context
✅ This: Multi-turn, remembers context, modifies orders

### vs Competitors:
❌ Others: Pre-recorded messages
✅ This: Dynamic AI responses, learns from conversation

---

## 📞 Support

If you encounter issues:
1. Check backend terminal for errors
2. Check Twilio console logs
3. Verify all environment variables
4. Ensure ngrok is running and URL is updated

---

## 🎉 Success Criteria

You've successfully set up the system when:
- ✅ You can sign up and login
- ✅ You can add items to cart
- ✅ You receive a call 30 seconds after placing order
- ✅ Bot speaks in your selected language
- ✅ You can have a conversation (not just press buttons)
- ✅ Admin dashboard shows all details
- ✅ Modifications are tracked and displayed

---

**Built with ❤️ using FastAPI, React, Twilio, Gemini AI, and Supabase**

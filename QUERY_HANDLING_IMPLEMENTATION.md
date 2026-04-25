# Advanced Conversational Query Handling - Implementation Summary

## Overview
This document summarizes the implementation of the post-confirmation query handling system that allows users to ask questions after confirming their order.

## Features Implemented

### 1. Post-Confirmation Query System
After user confirms order, bot asks: "Do you have any questions about your order?"

### 2. Supported Query Types

#### A. Location Change Query
- **User asks:** "Can I change the delivery location?" (in any language)
- **Bot response:** "I'm sorry, the delivery location is fixed and cannot be changed. If you want, you can cancel this order and place a new one. Would you like to cancel or keep the order?"
- **User options:**
  - Cancel → Order cancelled
  - Keep → Order confirmed

#### B. Delivery Time Query
- **User asks:** "What time will my order be delivered?" (in any language)
- **Bot response:** "Your order will be delivered at [time] on [date]. Would you like to change the delivery time?"
- **User options:**
  - Yes → Bot waits for new time
  - No → Order confirmed

#### C. Time Change Request
- **User says:** "Can I change it to 8 PM?" (or any time format)
- **Bot validates:** 
  - If 0-5 hours LATER than original → APPROVED
  - If more than 5 hours or EARLIER → REJECTED
- **Approval:** "Sure, I've updated your delivery time to [new time]. Your order is confirmed!"
- **Rejection:** "I'm sorry, we can only reschedule within 5 hours from the original time. Would you like to keep the original time or cancel?"

### 3. Multi-Language Support
All responses work in:
- English (en)
- Hindi (hi)
- Kannada (kn)
- Marathi (mr)

### 4. Multi-Turn Conversation
System maintains conversation context across multiple turns, allowing users to ask multiple questions in sequence.

## Technical Implementation

### File Structure
```
backend/
├── services/
│   ├── ai_handler_v2.py      # AI processing with query handling
│   ├── twilio_handler_v2.py  # TwiML generation
│   ├── tts_handler.py         # Text-to-speech config
│   ├── audio_generator.py    # gTTS audio generation
│   └── db_handler.py          # Database operations
└── routes/
    └── api.py                 # API endpoints & intent handling
```

### Key Components

#### 1. AI Handler (`ai_handler_v2.py`)
- **Function:** `process_voice_input()`
- **Features:**
  - Pattern matching for simple yes/no responses
  - Gemini AI for complex queries
  - Intent classification: `confirm`, `cancel`, `query_location`, `query_time`, `modify_time`, `keep_order`, `query`
  - Language detection
  - Conversation context tracking

#### 2. API Route (`api.py`)
- **Endpoint:** `/process-speech`
- **Features:**
  - Intent handling logic
  - Time parsing from natural language
  - Time validation (0-5 hour window)
  - Database updates
  - TwiML response generation

#### 3. Time Parsing (`api.py`)
- **Function:** `parse_delivery_time_from_text()`
- **Supported formats:**
  - "8 PM", "8:30 PM"
  - "20:00", "08:30"
  - "8", "20"

#### 4. Time Validation (`api.py`)
- **Function:** `validate_time_change()`
- **Logic:** Validates if new time is 0-5 hours LATER than original
- **Returns:** `(is_valid: bool, hours_difference: float)`

### Database Schema

#### Tables Used
1. **orders** - Order information and status
2. **order_items** - Items in each order
3. **conversation_history** - All conversation turns
4. **order_modifications** - Logged modifications
5. **call_logs** - Call attempt tracking

#### Order Status Values
- `pending` - Order placed, waiting for call
- `confirmed` - User confirmed order
- `cancelled` - User cancelled order
- `modified` - Order modified (time/address changed)

## Intent Flow Diagram

```
Initial Call
    ↓
"Do you want to confirm this order?"
    ↓
User: "Yes"
    ↓
intent: "confirm"
    ↓
"Do you have any questions about your order?"
    ↓
┌─────────────────┬──────────────────┬─────────────────┐
│                 │                  │                 │
Location Query   Time Query      No Questions      Other
    ↓                ↓                ↓                ↓
"Location fixed" "Delivered at..." "Thank you!"   "I didn't understand"
    ↓                ↓                              
"Cancel/Keep?"   "Change time?"                    
    ↓                ↓                              
Cancel/Keep      Yes/No                            
                     ↓                              
                 "New time?"                        
                     ↓                              
                 Validate                           
                     ↓                              
              Approve/Reject                        
```

## Conversation Context Tracking

Each conversation turn is saved with:
- `turn_number` - Sequential turn number
- `user_input` - What user said
- `detected_language` - Language detected
- `ai_intent` - Intent classified by AI
- `ai_response` - Bot's response

This allows:
- Multi-turn conversations
- Context-aware responses
- Conversation history in admin dashboard

## Time Validation Logic

```python
def validate_time_change(new_time_str, original_time_str):
    original = parse_datetime(original_time_str)
    new_time = parse_datetime(new_time_str)
    
    hours_diff = (new_time - original).total_seconds() / 3600
    
    # Valid if 0 <= diff <= 5 (0 to 5 hours later)
    is_valid = 0 <= hours_diff <= 5
    
    return is_valid, hours_diff
```

**Examples:**
- Original: 6:00 PM, New: 8:00 PM → 2 hours later → ✅ APPROVED
- Original: 6:00 PM, New: 11:00 PM → 5 hours later → ✅ APPROVED
- Original: 6:00 PM, New: 4:00 PM → 2 hours earlier → ❌ REJECTED
- Original: 6:00 PM, New: 12:00 AM → 6 hours later → ❌ REJECTED

## Audio Generation

### Language-Specific Audio
- **English & Hindi:** Twilio Polly voices
- **Kannada & Marathi:** gTTS (Google Text-to-Speech)

### Audio Files
Generated in `backend/audio_files/`:
- `turn_{order_id}_{turn_number}.mp3` - Each conversation turn
- `final_{order_id}_{turn_number}.mp3` - Final response

## API Endpoints

### Voice Webhook
```
POST /voice?order_id={order_id}
```
Generates initial greeting TwiML

### Speech Processing
```
POST /process-speech?order_id={order_id}&turn={turn_number}
```
Processes user speech and generates response

### Call Status
```
POST /call-status?order_id={order_id}
```
Updates call status and handles retries

## Testing

See `TEST_CONVERSATION_FLOWS.md` for comprehensive testing guide.

### Quick Test
1. Place order with delivery time 2 hours from now
2. Answer call
3. Say "Yes" to confirm
4. When asked about questions, say "Can I change the time to 8 PM?"
5. Verify time is updated if within 5-hour window

## Debugging

### Enable Debug Logs
Check console for:
- `[AI Handler]` - AI processing logs
- `[API]` - Intent handling logs
- `=== Speech Processing ===` - Speech input logs

### Common Issues

**Issue:** AI doesn't understand query
- **Solution:** Check Gemini API key, verify prompt in `ai_handler_v2.py`

**Issue:** Time validation fails
- **Solution:** Check `validate_time_change()` function, verify time parsing

**Issue:** Audio doesn't play (Kannada/Marathi)
- **Solution:** Check `audio_files/` folder, verify gTTS is installed

**Issue:** Conversation doesn't continue
- **Solution:** Check `continue_conversation` flag in AI response

## Future Enhancements

Potential improvements:
1. Support for item modifications (add/remove items)
2. Support for quantity changes
3. More flexible time windows (configurable)
4. Support for multiple delivery addresses
5. Integration with payment gateway
6. SMS confirmation after call
7. Email notifications
8. Real-time order tracking

## Code Snippets

### Adding New Intent

1. **Update AI Handler:**
```python
# In ai_handler_v2.py
# Add to INTENT CLASSIFICATION section in prompt
- "new_intent" = Description of when to use this intent
```

2. **Update API Route:**
```python
# In api.py, process_speech endpoint
elif ai_result["intent"] == "new_intent":
    # Handle the new intent
    # Update database
    # Generate response
```

3. **Add Translations:**
```python
# In ai_handler_v2.py
responses = {
    "en": "English response",
    "hi": "Hindi response",
    "kn": "Kannada response",
    "mr": "Marathi response"
}
```

## Performance Considerations

- Pattern matching is used for simple yes/no before AI (faster)
- Conversation context limited to last 5 turns (reduces token usage)
- Audio files cached in `audio_files/` folder (reduces generation time)
- Database queries optimized with proper indexes

## Security Considerations

- All user inputs sanitized before database insertion
- Phone numbers validated before call initiation
- API endpoints protected with proper error handling
- Twilio webhooks verified (recommended for production)

## Deployment Checklist

- [ ] Set all environment variables
- [ ] Test all conversation flows
- [ ] Verify audio generation works
- [ ] Test time validation logic
- [ ] Check database schema is up to date
- [ ] Test in all 4 languages
- [ ] Verify Twilio account is not in trial mode
- [ ] Set up proper error logging
- [ ] Configure retry logic
- [ ] Test edge cases

## Support

For issues or questions:
1. Check console logs for errors
2. Review `TEST_CONVERSATION_FLOWS.md`
3. Verify all environment variables are set
4. Check Twilio logs for call issues
5. Verify Gemini API quota

---

**Last Updated:** April 25, 2026
**Version:** 2.0
**Status:** ✅ Implementation Complete

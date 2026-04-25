# Conversation Flow Testing Guide

## Overview
This guide helps you test the advanced conversational query handling system after order confirmation.

## Test Scenarios

### Scenario 1: Simple Confirmation (No Queries)
**Flow:**
1. Bot: "Hi [Name], this is about your order of [items]. Do you want to confirm this order?"
2. User: "Yes" / "हाँ" / "ಹೌದು" / "होय"
3. Bot: "Great! Your order is confirmed. Do you have any questions about your order?"
4. User: "No" / "नहीं" / "ಇಲ್ಲ" / "नाही"
5. Bot: "Great! Your order is confirmed. Thank you for ordering with us. Goodbye!"

**Expected Result:** Order status = "confirmed", call ends

---

### Scenario 2: Location Change Query (Cancel Order)
**Flow:**
1. Bot: "Hi [Name], this is about your order of [items]. Do you want to confirm this order?"
2. User: "Yes"
3. Bot: "Great! Your order is confirmed. Do you have any questions about your order?"
4. User: "Can I change the delivery location?" / "पता बदल सकता हूं?" / "ವಿಳಾಸ ಬದಲಿಸಬಹುದೇ?" / "पत्ता बदलू शकतो का?"
5. Bot: "I'm sorry, the delivery location is fixed and cannot be changed. If you want, you can cancel this order and place a new one. Would you like to cancel or keep the order?"
6. User: "Cancel" / "रद्द करें" / "ರದ್ದು ಮಾಡಿ" / "रद्द करा"
7. Bot: "Okay, your order has been cancelled. Goodbye!"

**Expected Result:** Order status = "cancelled"

---

### Scenario 3: Location Change Query (Keep Order)
**Flow:**
1. Bot: "Hi [Name], this is about your order of [items]. Do you want to confirm this order?"
2. User: "Yes"
3. Bot: "Great! Your order is confirmed. Do you have any questions about your order?"
4. User: "Can I change the address?"
5. Bot: "I'm sorry, the delivery location is fixed and cannot be changed. If you want, you can cancel this order and place a new one. Would you like to cancel or keep the order?"
6. User: "Keep it" / "रखें" / "ಇರಲಿ" / "ठेवा"
7. Bot: "Great! Your order is confirmed. Thank you for ordering with us. Goodbye!"

**Expected Result:** Order status = "confirmed"

---

### Scenario 4: Delivery Time Query (No Change)
**Flow:**
1. Bot: "Hi [Name], this is about your order of [items]. Do you want to confirm this order?"
2. User: "Yes"
3. Bot: "Great! Your order is confirmed. Do you have any questions about your order?"
4. User: "What time will my order be delivered?" / "कब डिलीवर होगा?" / "ಯಾವಾಗ ಡೆಲಿವರಿ?" / "केव्हा डिलिव्हरी होईल?"
5. Bot: "Your order will be delivered at [time] on [date]. Would you like to change the delivery time?"
6. User: "No"
7. Bot: "Great! Your order is confirmed. Thank you for ordering with us. Goodbye!"

**Expected Result:** Order status = "confirmed", no time change

---

### Scenario 5: Delivery Time Change (Approved - Within 5 Hours)
**Flow:**
1. Bot: "Hi [Name], this is about your order of [items]. Do you want to confirm this order?"
2. User: "Yes"
3. Bot: "Great! Your order is confirmed. Do you have any questions about your order?"
4. User: "What time will it be delivered?"
5. Bot: "Your order will be delivered at [time] on [date]. Would you like to change the delivery time?"
6. User: "Can I change it to 8 PM?" / "8 बजे कर सकते हैं?" / "8 ಗಂಟೆಗೆ ಮಾಡಬಹುದೇ?" / "8 वाजता करू शकतो का?"
7. Bot: "Sure, I've updated your delivery time to 8:00 PM. Your order is confirmed!"

**Expected Result:** 
- Order status = "confirmed"
- Delivery time updated to 8:00 PM
- Modification logged in database

**Test Cases:**
- Original time: 6:00 PM, New time: 8:00 PM (2 hours later) ✅ APPROVED
- Original time: 5:00 PM, New time: 10:00 PM (5 hours later) ✅ APPROVED
- Original time: 6:00 PM, New time: 6:30 PM (30 min later) ✅ APPROVED

---

### Scenario 6: Delivery Time Change (Rejected - Outside 5 Hour Window)
**Flow:**
1. Bot: "Hi [Name], this is about your order of [items]. Do you want to confirm this order?"
2. User: "Yes"
3. Bot: "Great! Your order is confirmed. Do you have any questions about your order?"
4. User: "Can I change the time to tomorrow morning?"
5. Bot: "I'm sorry, we can only reschedule within 5 hours from the original time. Would you like to keep the original time or cancel?"
6. User: "Keep it"
7. Bot: "Great! Your order is confirmed. Thank you for ordering with us. Goodbye!"

**Expected Result:** 
- Order status = "confirmed"
- Delivery time NOT changed
- No modification logged

**Test Cases:**
- Original time: 6:00 PM, New time: 4:00 PM (2 hours earlier) ❌ REJECTED
- Original time: 6:00 PM, New time: 12:00 AM next day (6 hours later) ❌ REJECTED
- Original time: 6:00 PM, New time: 9:00 AM next day (15 hours later) ❌ REJECTED

---

### Scenario 7: Multiple Queries in Sequence
**Flow:**
1. Bot: "Hi [Name], this is about your order of [items]. Do you want to confirm this order?"
2. User: "Yes"
3. Bot: "Great! Your order is confirmed. Do you have any questions about your order?"
4. User: "What time will it be delivered?"
5. Bot: "Your order will be delivered at 6:00 PM on April 25, 2026. Would you like to change the delivery time?"
6. User: "No, but can I change the location?"
7. Bot: "I'm sorry, the delivery location is fixed and cannot be changed. If you want, you can cancel this order and place a new one. Would you like to cancel or keep the order?"
8. User: "Keep it"
9. Bot: "Great! Your order is confirmed. Thank you for ordering with us. Goodbye!"

**Expected Result:** Order status = "confirmed", no changes made

---

## Testing Checklist

### Language Testing
- [ ] Test all flows in English
- [ ] Test all flows in Hindi (हिंदी)
- [ ] Test all flows in Kannada (ಕನ್ನಡ)
- [ ] Test all flows in Marathi (मराठी)

### Audio Testing
- [ ] Verify Kannada audio uses gTTS (not Twilio Say)
- [ ] Verify Marathi audio uses gTTS (not Twilio Say)
- [ ] Verify English audio uses Twilio Polly
- [ ] Verify Hindi audio uses Twilio Polly

### Time Parsing Testing
Test these time formats:
- [ ] "8 PM" → 20:00
- [ ] "8:30 PM" → 20:30
- [ ] "20:00" → 20:00
- [ ] "8" → 20:00 (if current time is afternoon)

### Time Validation Testing
- [ ] 0 hours later (same time) → APPROVED
- [ ] 2 hours later → APPROVED
- [ ] 5 hours later → APPROVED
- [ ] 6 hours later → REJECTED
- [ ] 2 hours earlier → REJECTED

### Database Verification
After each test, check:
- [ ] Order status updated correctly
- [ ] Conversation turns saved in database
- [ ] Modifications logged (if applicable)
- [ ] Call logs updated

### Edge Cases
- [ ] User says unclear response (e.g., "how do", "car accident")
- [ ] User switches languages mid-conversation
- [ ] User asks unrelated questions
- [ ] User hangs up mid-conversation
- [ ] Multiple time change requests

---

## How to Test

1. **Start Backend:**
   ```bash
   cd backend
   python main.py
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Place Test Order:**
   - Login with test phone number
   - Add items to cart
   - Select language (English/Hindi/Kannada/Marathi)
   - Set delivery time (e.g., 2 hours from now)
   - Place order

4. **Wait for Call:**
   - Call will come after 30 seconds
   - Answer and follow test scenario

5. **Verify Results:**
   - Check Admin Dashboard for order status
   - Click on order to see conversation history
   - Verify modifications (if any)

---

## Debugging Tips

### If AI doesn't understand:
- Check console logs for `[AI Handler]` messages
- Verify Gemini API key is set
- Check if pattern matching is working

### If audio doesn't play:
- Check `backend/audio_files/` folder for generated MP3s
- Verify gTTS is installed: `pip install gtts`
- Check Twilio logs for audio URL errors

### If time validation fails:
- Check console for `[API] Time change rejected` message
- Verify time parsing is working correctly
- Check original delivery time vs new time

### If conversation doesn't continue:
- Check `continue_conversation` flag in AI response
- Verify TwiML has `<Gather>` tag
- Check if conversation turns are being saved

---

## Expected Console Output

```
=== Voice Webhook Called ===
Order ID: 123e4567-e89b-12d3-a456-426614174000

=== Speech Processing (Turn 1) ===
Order ID: 123e4567-e89b-12d3-a456-426614174000
User input: 'Yes'
[AI Handler] Processing input: 'Yes'
[AI Handler] PATTERN MATCH - Initial Confirm detected!

=== Speech Processing (Turn 2) ===
User input: 'Can I change the time to 8 PM?'
[AI Handler] No pattern match, sending to Gemini AI...
AI Result: {'intent': 'modify_time', 'detected_language': 'en', ...}
[API] Time change approved: 2.0 hours difference
```

---

## Success Criteria

✅ All 7 scenarios work correctly
✅ All 4 languages work properly
✅ Audio plays correctly (gTTS for Kannada/Marathi)
✅ Time validation works (0-5 hour window)
✅ Database updates correctly
✅ Conversation history saved
✅ Admin dashboard shows all details

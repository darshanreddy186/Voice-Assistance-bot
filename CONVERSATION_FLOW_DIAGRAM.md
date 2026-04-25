# Conversation Flow Diagram

## Complete Flow Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                     ORDER PLACED BY USER                        │
│                    (Frontend → Backend)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ⏰ Wait 30 seconds
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TWILIO INITIATES CALL                        │
│                  (Twilio → User's Phone)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      TURN 1: GREETING                           │
│  Bot: "Hi [Name], this is about your order of [items].         │
│        Do you want to confirm this order?"                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    👤 User Responds
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    "Yes" ✅            "No" ❌           "Unclear" ❓
        │                    │                    │
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────────┐
│ Intent:       │  │ Intent:      │  │ Intent: query    │
│ "confirm"     │  │ "cancel"     │  │ "Please repeat"  │
└───────┬───────┘  └──────┬───────┘  └────────┬─────────┘
        │                  │                    │
        │                  │                    └─────► End Call
        │                  │
        │                  └─────► Order Cancelled → End Call
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   TURN 2: ASK FOR QUERIES                       │
│  Bot: "Great! Your order is confirmed.                          │
│        Do you have any questions about your order?"             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    👤 User Responds
                             │
        ┌────────────────────┼────────────────────┬──────────────┐
        │                    │                    │              │
        ▼                    ▼                    ▼              ▼
   "No" / "Nope"      Location Query        Time Query      Other
        │                    │                    │              │
        │                    │                    │              │
        ▼                    ▼                    ▼              ▼
┌───────────────┐  ┌──────────────────┐  ┌──────────────┐  ┌─────────┐
│ End Call      │  │ "Location fixed" │  │ "Delivered   │  │ "I didn't│
│ "Thank you!"  │  │ "Cancel/Keep?"   │  │  at [time]"  │  │ understand│
└───────────────┘  └────────┬─────────┘  └──────┬───────┘  └────┬────┘
                             │                    │               │
                             ▼                    ▼               │
                    👤 User Choice         👤 User Choice        │
                             │                    │               │
                    ┌────────┼────────┐  ┌────────┼────────┐     │
                    │                 │  │                 │     │
                    ▼                 ▼  ▼                 ▼     │
              "Cancel" ❌      "Keep" ✅ "Yes"          "No" ✅   │
                    │                 │  │                 │     │
                    │                 │  │                 │     │
                    ▼                 ▼  ▼                 ▼     │
            Order Cancelled    Order Confirmed  "New time?"  Confirmed
            End Call           End Call              │              │
                                                     ▼              │
                                            👤 User Says Time      │
                                                     │              │
                                                     ▼              │
                                            ⚙️ Validate Time       │
                                                     │              │
                                        ┌────────────┼────────┐    │
                                        │                     │    │
                                        ▼                     ▼    │
                                  ✅ APPROVED           ❌ REJECTED │
                                  (0-5 hrs later)      (Outside)   │
                                        │                     │    │
                                        ▼                     ▼    │
                              "Time updated!"      "Can't change"  │
                              Order Confirmed      "Cancel/Keep?"  │
                              End Call                     │       │
                                                          ▼       │
                                                  👤 User Choice   │
                                                          │       │
                                                  ┌───────┼───┐   │
                                                  │           │   │
                                                  ▼           ▼   │
                                            "Cancel"    "Keep"    │
                                                  │           │   │
                                                  ▼           ▼   │
                                          Cancelled    Confirmed  │
                                          End Call     End Call   │
                                                                  │
                                                                  │
                                                  ┌───────────────┘
                                                  │
                                                  ▼
                                          Continue Conversation
                                          (Ask again or clarify)
```

## Intent Classification Tree

```
User Input
    │
    ├─ Pattern Match (Fast Path)
    │   ├─ "yes", "हाँ", "ಹೌದು", "होय" → confirm
    │   ├─ "no", "नहीं", "ಇಲ್ಲ", "नाही" → cancel
    │   └─ Other → Send to AI
    │
    └─ Gemini AI Processing
        │
        ├─ Confirmation Intent
        │   └─ "confirm" → Ask for queries
        │
        ├─ Cancellation Intent
        │   └─ "cancel" → Cancel order
        │
        ├─ Location Query Intent
        │   └─ "query_location" → Explain fixed location
        │       └─ Ask: Cancel or Keep?
        │           ├─ "cancel" → Cancel order
        │           └─ "keep_order" → Confirm order
        │
        ├─ Time Query Intent
        │   └─ "query_time" → Tell delivery time
        │       └─ Ask: Change time?
        │           ├─ "yes" → Wait for new time
        │           └─ "no" → Confirm order
        │
        ├─ Time Modification Intent
        │   └─ "modify_time" → Extract new time
        │       └─ Validate time (0-5 hrs later)
        │           ├─ Valid → Update & Confirm
        │           └─ Invalid → Reject & Ask Cancel/Keep
        │
        └─ Unknown Intent
            └─ "query" → Ask for clarification
```

## Time Validation Logic

```
Original Time: 6:00 PM
                │
                ▼
User Requests New Time
                │
                ▼
Parse Time String
    │
    ├─ "8 PM" → 20:00
    ├─ "8:30 PM" → 20:30
    ├─ "20:00" → 20:00
    └─ "8" → 20:00 (if afternoon)
                │
                ▼
Calculate Difference
    │
    ├─ New: 8:00 PM (20:00)
    │   Diff: 2 hours later
    │   Result: ✅ APPROVED
    │
    ├─ New: 11:00 PM (23:00)
    │   Diff: 5 hours later
    │   Result: ✅ APPROVED
    │
    ├─ New: 4:00 PM (16:00)
    │   Diff: -2 hours (earlier)
    │   Result: ❌ REJECTED
    │
    └─ New: 12:00 AM (00:00)
        Diff: 6 hours later
        Result: ❌ REJECTED
```

## Database Updates Flow

```
User Confirms Order
        │
        ▼
┌─────────────────────┐
│ orders table        │
│ status: "confirmed" │
└─────────────────────┘
        │
        ▼
┌──────────────────────────┐
│ conversation_history     │
│ turn_number: 1           │
│ user_input: "Yes"        │
│ ai_intent: "confirm"     │
│ ai_response: "Great!"    │
└──────────────────────────┘

User Asks to Change Time
        │
        ▼
┌──────────────────────────┐
│ conversation_history     │
│ turn_number: 2           │
│ user_input: "8 PM"       │
│ ai_intent: "modify_time" │
└──────────────────────────┘
        │
        ▼
Time Validated & Approved
        │
        ▼
┌─────────────────────────────┐
│ orders table                │
│ delivery_datetime: updated  │
│ status: "confirmed"         │
└─────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│ order_modifications          │
│ type: "delivery_time"        │
│ old_value: "18:00"           │
│ new_value: "20:00"           │
│ user_input: "8 PM"           │
│ ai_response: "Time updated!" │
└──────────────────────────────┘
```

## Multi-Language Flow

```
User Places Order
        │
        ▼
Select Language
        │
    ┌───┴───┬───────┬────────┐
    │       │       │        │
    ▼       ▼       ▼        ▼
English  Hindi  Kannada  Marathi
    │       │       │        │
    └───┬───┴───┬───┴────┬───┘
        │       │        │
        ▼       ▼        ▼
    Call Initiated
        │
        ▼
    Greeting in Selected Language
        │
        ▼
    User Responds (Any Language)
        │
        ▼
    AI Detects Language
        │
        ▼
    Response in Detected Language
        │
        ▼
    Audio Generation
        │
    ┌───┴───────────┬──────────┐
    │               │          │
    ▼               ▼          ▼
English/Hindi   Kannada    Marathi
Twilio Polly     gTTS       gTTS
    │               │          │
    └───┬───────────┴──────────┘
        │
        ▼
    Play Audio to User
```

## Error Handling Flow

```
User Input Received
        │
        ▼
Try Pattern Match
        │
    ┌───┴───┐
    │       │
    ▼       ▼
  Match   No Match
    │       │
    │       ▼
    │   Try Gemini AI
    │       │
    │   ┌───┴───┐
    │   │       │
    │   ▼       ▼
    │ Success  Error
    │   │       │
    │   │       ▼
    │   │   Log Error
    │   │       │
    │   │       ▼
    │   │   Return Default Response
    │   │   (in user's language)
    │   │       │
    └───┴───────┘
        │
        ▼
    Generate TwiML
        │
    ┌───┴───┐
    │       │
    ▼       ▼
Continue  End Call
    │       │
    ▼       ▼
<Gather> <Say>
  │       │
  │       └─► Hangup
  │
  └─► Wait for Next Input
```

## Call Status Flow

```
Call Initiated
        │
        ▼
    Call Status?
        │
    ┌───┴───┬────────┬─────────┐
    │       │        │         │
    ▼       ▼        ▼         ▼
Completed No-Answer Busy    Failed
    │       │        │         │
    │       │        │         │
    ▼       ▼        ▼         ▼
Update   Retry    Retry    Log Error
Call Log  (1 min)  (2 min)     │
    │       │        │         │
    │       │        │         │
    ▼       ▼        ▼         ▼
  Done   Schedule Schedule   Done
         Next Call Next Call
             │        │
             │        │
             └────┬───┘
                  │
                  ▼
            Max Attempts?
                  │
              ┌───┴───┐
              │       │
              ▼       ▼
            Yes      No
              │       │
              ▼       ▼
            Stop   Continue
           Retry   Retrying
```

---

## Legend

- 📞 = Phone call
- 👤 = User action
- 🤖 = Bot action
- ⚙️ = System processing
- ⏰ = Time-based action
- ✅ = Success/Approved
- ❌ = Failure/Rejected
- ❓ = Unclear/Query
- 🔄 = Loop/Retry

---

**Note:** This diagram shows the complete conversation flow including all possible paths and decision points. In practice, each call will follow only one path through the tree based on user responses.

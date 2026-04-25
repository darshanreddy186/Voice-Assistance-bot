import os
import json
import re
from dotenv import load_dotenv
from datetime import datetime
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def _normalize(text: str) -> str:
    """Remove ASCII punctuation and filler words. Fully preserve non-ASCII scripts."""
    # Only remove ASCII punctuation (periods, commas, etc.) — leave Unicode intact
    cleaned = re.sub(r"[!\"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~]", " ", text)
    cleaned = cleaned.lower()
    # Remove English filler words only
    fillers = r"\b(uh|um|like|maybe|you know|i mean|please|just|so)\b"
    cleaned = re.sub(fillers, "", cleaned)
    return re.sub(r"\s+", " ", cleaned).strip()


def process_voice_input(user_input: str, order_data: dict, conversation_context: list = None) -> dict:
    user_lower = _normalize(user_input)
    try:
        print(f"\n[AI Handler] Raw='{user_input}' | Normalized='{user_lower}'")
    except UnicodeEncodeError:
        print(f"\n[AI Handler] Raw=(non-ascii) | Normalized=(non-ascii)")

    preferred_lang = order_data.get("language", "en-US")
    lang_short = preferred_lang.split("-")[0]

    has_confirmed = any(
        t.get("ai_intent") == "confirm"
        for t in (conversation_context or [])
    )
    try:
        print(f"[AI Handler] has_confirmed={has_confirmed}")
    except Exception:
        pass

    # ── PHASE 1: Before confirmation — fast yes/no only ──────────────────────
    if not has_confirmed:
        confirm_words = [
            "yes", "yeah", "yep", "ok", "okay", "sure", "confirm", "correct",
            "हाँ", "हां", "ठीक", "सही", "कन्फर्म",
            "ಹೌದು", "ಸರಿ", "ಓಕೆ", "होय", "बरोबर",
        ]
        cancel_words = [
            "no", "nope", "cancel", "नहीं", "नही", "रद्द",
            "ಇಲ್ಲ", "ಬೇಡ", "ರದ್ದು", "नाही", "नको",
        ]
        words = user_lower.split()

        # Match if ANY confirm word appears and NO cancel word appears
        has_confirm = any(w in confirm_words for w in words)
        has_cancel = any(w in cancel_words for w in words)

        if has_confirm and not has_cancel:
            print("[AI Handler] FAST PATH -> initial confirm")
            return _make_confirm_response(preferred_lang, lang_short)

        if has_cancel and not has_confirm:
            print("[AI Handler] FAST PATH -> initial cancel")
            return _make_cancel_response(preferred_lang, lang_short)

    # ── PHASE 2: After confirmation — ALL intents go to Gemini NLU ──────────
    # (No keyword matching here — Gemini understands meaning, keywords don't)
    print("[AI Handler] -> Gemini NLU")
    return _gemini_nlu(user_input, user_lower, order_data, conversation_context or [], has_confirmed)


def _gemini_nlu(user_input: str, user_lower: str, order_data: dict,
                conversation_context: list, has_confirmed: bool) -> dict:

    preferred_lang = order_data.get("language", "en-US")
    lang_short = preferred_lang.split("-")[0]

    items_str = ", ".join(
        f"{i['quantity']}x {i['product_name']}"
        for i in order_data.get("order_items", [])
    )
    try:
        dt = datetime.fromisoformat(
            order_data.get("delivery_datetime", "").replace("Z", "+00:00")
        )
        delivery_time_str = dt.strftime("%I:%M %p")
        delivery_date_str = dt.strftime("%B %d, %Y")
    except Exception:
        delivery_time_str = "scheduled time"
        delivery_date_str = "scheduled date"

    history = "\n".join(
        f"  Turn {t['turn_number']}: User='{t['user_input']}' Bot='{t['ai_response']}'"
        for t in conversation_context[-6:]
    ) or "  (none)"

    phase = "POST_CONFIRMATION" if has_confirmed else "AWAITING_CONFIRMATION"

    prompt = f"""You are an AI voice assistant for food order confirmation calls.
Understand what the user MEANS. Do not match keywords — understand intent.

ORDER:
  Customer : {order_data.get('customer_name')}
  Items    : {items_str}
  Delivery : {delivery_time_str} on {delivery_date_str}
  Address  : {order_data.get('address')}
  Language : {preferred_lang}

CONVERSATION SO FAR:
{history}

PHASE: {phase}
USER SAID: "{user_input}"

INTENTS (pick exactly one):
  confirm        - user agrees to the order [only in AWAITING_CONFIRMATION]
  cancel         - user wants to cancel the order
  query_location - user asks about changing delivery address/location
  query_time     - user asks WHAT TIME their order arrives (not asking to change it)
  modify_time    - user wants to change/reschedule delivery to a NEW specific time
  keep_order     - user wants to keep the order unchanged (after cancel/keep question)
  no_query       - user says no questions / they're done / goodbye
  unclear        - cannot determine intent at all

CRITICAL RULES — read carefully:
- "change delivery timing/time/schedule" WITHOUT a new time -> intent: query_time (ask what time they want)
- "change delivery timing to 7 PM" WITH a new time -> intent: modify_time, extract "7:00 PM"
- "can I receive at 7 PM" -> intent: modify_time, delivery_time: "7:00 PM"
- "reschedule to 8" -> intent: modify_time, delivery_time: "8:00 PM"
- "change address/location" -> intent: query_location
- "cancel" / "please cancel" / "cancel the order" -> intent: cancel
- "keep it" / "keep the order" / "that's fine" -> intent: keep_order
- "no" / "no questions" / "that's all" / "good" / "okay bye" -> intent: no_query
- NEVER return query_location for time-related requests
- NEVER return query_time for location-related requests

FOR modify_time: also validate the new time vs original {delivery_time_str}:
  - 0 to 5 hours LATER -> time_change_approved: true
  - Earlier OR more than 5 hours later -> time_change_approved: false

LANGUAGE DETECTION:
  - Hindi words present -> "hi"
  - Kannada words present -> "kn"  
  - Marathi words present -> "mr"
  - Otherwise -> "en"
  Respond in the detected language.

Return ONLY valid JSON (no markdown, no explanation):
{{
  "intent": "<intent>",
  "detected_language": "<en|hi|kn|mr>",
  "modifications": {{
    "delivery_time": "<time string or null>",
    "time_change_approved": <true|false|null>
  }},
  "response_text": "<your spoken reply in detected language>",
  "continue_conversation": <true|false>
}}

continue_conversation=false for: cancel, keep_order, no_query, approved modify_time, confirm
continue_conversation=true for: query_location, query_time, rejected modify_time, unclear
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        raw = response.text.strip()
        try:
            print(f"[Gemini Raw]: {raw[:200]}")
        except UnicodeEncodeError:
            print("[Gemini Raw]: (non-ascii response)")

        # Strip markdown fences
        raw = re.sub(r"```(?:json)?", "", raw).strip().strip("`").strip()

        result = json.loads(raw)

        # Ensure all required fields exist
        result.setdefault("intent", "unclear")
        result.setdefault("detected_language", lang_short)
        result.setdefault("modifications", {})
        result.setdefault(
            "continue_conversation",
            result["intent"] in ["query_location", "query_time", "unclear"]
        )

        if not result.get("response_text"):
            result["response_text"] = _fallback_msg(
                result["intent"], preferred_lang, delivery_time_str, delivery_date_str
            )

        # Override query_location response — always use our fixed message
        if result["intent"] == "query_location":
            result["response_text"] = _fallback_msg(
                "query_location", preferred_lang, delivery_time_str, delivery_date_str
            )

        # Override confirm — always ask for queries and keep conversation open
        if result["intent"] == "confirm":
            result["response_text"] = _make_confirm_response(preferred_lang, lang_short)["response_text"]
            result["continue_conversation"] = True

        # Override cancel/keep_order/no_query — always use our canned goodbye
        if result["intent"] in ("cancel", "keep_order", "no_query"):
            result["continue_conversation"] = False

        try:
            print(f"[AI Handler] Intent={result['intent']} Lang={result['detected_language']} Continue={result['continue_conversation']}")
        except UnicodeEncodeError:
            print(f"[AI Handler] Intent={result['intent']} Continue={result['continue_conversation']}")
        return result

    except Exception as e:
        print(f"[Gemini ERROR]: {e}")
        import traceback; traceback.print_exc()
        return {
            "intent": "unclear",
            "detected_language": lang_short,
            "modifications": {},
            "response_text": _fallback_msg("unclear", preferred_lang, delivery_time_str, delivery_date_str),
            "continue_conversation": True,
        }


# ── Canned responses ─────────────────────────────────────────────────────────

def _make_confirm_response(preferred_lang: str, lang_short: str) -> dict:
    msgs = {
        "en-US": "Great! Your order is confirmed. Do you have any questions about your order?",
        "hi-IN": "बहुत बढ़िया! आपका ऑर्डर कन्फर्म हो गया है। क्या आपके ऑर्डर के बारे में कोई सवाल है?",
        "kn-IN": "ಅದ್ಭುತ! ನಿಮ್ಮ ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಆರ್ಡರ್ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿವೆಯೇ?",
        "mr-IN": "छान! तुमची ऑर्डर पुष्टी झाली आहे. तुमच्या ऑर्डरबद्दल काही प्रश्न आहेत का?",
    }
    return {
        "intent": "confirm",
        "detected_language": lang_short,
        "modifications": {},
        "response_text": msgs.get(preferred_lang, msgs["en-US"]),
        "continue_conversation": True,
    }


def _make_cancel_response(preferred_lang: str, lang_short: str) -> dict:
    msgs = {
        "en-US": "Okay, your order has been cancelled. Goodbye!",
        "hi-IN": "ठीक है, आपका ऑर्डर रद्द कर दिया गया है। अलविदा!",
        "kn-IN": "ಸರಿ, ನಿಮ್ಮ ಆರ್ಡರ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ. ವಿದಾಯ!",
        "mr-IN": "ठीक आहे, तुमची ऑर्डर रद्द करण्यात आली आहे. निरोप!",
    }
    return {
        "intent": "cancel",
        "detected_language": lang_short,
        "modifications": {},
        "response_text": msgs.get(preferred_lang, msgs["en-US"]),
        "continue_conversation": False,
    }


def _fallback_msg(intent: str, lang: str, delivery_time: str, delivery_date: str) -> str:
    table = {
        "unclear": {
            "en-US": "I'm sorry, I didn't catch that. Could you please repeat?",
            "hi-IN": "मुझे समझ नहीं आया। क्या आप दोबारा कह सकते हैं?",
            "kn-IN": "ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ.",
            "mr-IN": "मला समजले नाही. कृपया पुन्हा सांगा.",
        },
        "query_location": {
            "en-US": "I'm sorry, the delivery location is fixed and cannot be changed. Would you like to cancel or keep the order?",
            "hi-IN": "डिलीवरी का पता बदला नहीं जा सकता। रद्द करना चाहते हैं या ऑर्डर रखना चाहते हैं?",
            "kn-IN": "ಡೆಲಿವರಿ ವಿಳಾಸ ಬದಲಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ರದ್ದು ಮಾಡಬೇಕೇ ಅಥವಾ ಆರ್ಡರ್ ಇರಲಿ?",
            "mr-IN": "डिलिव्हरी पत्ता बदलता येत नाही. रद्द करायचा का की ऑर्डर ठेवायचा?",
        },
        "query_time": {
            "en-US": f"Your order will be delivered at {delivery_time} on {delivery_date}. Would you like to change the time?",
            "hi-IN": f"आपका ऑर्डर {delivery_date} को {delivery_time} पर डिलीवर होगा। क्या समय बदलना है?",
            "kn-IN": f"ನಿಮ್ಮ ಆರ್ಡರ್ {delivery_date} ರಂದು {delivery_time} ಗೆ ಬರುತ್ತದೆ. ಸಮಯ ಬದಲಿಸಬೇಕೇ?",
            "mr-IN": f"तुमचा ऑर्डर {delivery_date} रोजी {delivery_time} ला येईल. वेळ बदलायची आहे का?",
        },
        "no_query": {
            "en-US": "Thank you for ordering with us. Goodbye!",
            "hi-IN": "हमारे साथ ऑर्डर करने के लिए धन्यवाद। अलविदा!",
            "kn-IN": "ನಮ್ಮೊಂದಿಗೆ ಆರ್ಡರ್ ಮಾಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ವಿದಾಯ!",
            "mr-IN": "आमच्याकडे ऑर्डर दिल्याबद्दल धन्यवाद. निरोप!",
        },
    }
    bucket = table.get(intent, table["unclear"])
    return bucket.get(lang, bucket["en-US"])


def detect_language(text: str) -> str:
    try:
        r = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f'Detect language of: "{text}"\nReturn ONLY one of: en, hi, kn, mr'
        )
        lang = r.text.strip().lower()
        return lang if lang in ("en", "hi", "kn", "mr") else "en"
    except Exception:
        return "en"

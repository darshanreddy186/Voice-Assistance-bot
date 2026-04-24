import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

def process_voice_input(user_input: str, order_data: dict, conversation_context: list = None) -> dict:
    """
    Advanced AI processing with multi-turn conversation support.
    Returns: {
        "intent": "confirm/cancel/modify/query",
        "modifications": {...},
        "detected_language": "en/hi/kn/mr",
        "response_text": "...",
        "continue_conversation": true/false
    }
    """
    
    # Quick pattern matching for common responses (fallback before AI)
    user_lower = user_input.lower().strip()
    
    print(f"[AI Handler] Processing input: '{user_input}'")
    print(f"[AI Handler] Lowercase: '{user_lower}'")
    
    # Confirmation patterns
    confirm_patterns = [
        "yes", "yeah", "yep", "ok", "okay", "sure", "confirm", "correct", "right",
        "हाँ", "हां", "ठीक", "सही", "कन्फर्म",
        "ಹೌದು", "ಸರಿ", "ಓಕೆ",
        "होय", "ठीक", "बरोबर"
    ]
    
    # Cancel patterns
    cancel_patterns = [
        "no", "nope", "cancel", "stop", "don't",
        "नहीं", "नही", "रद्द", "बंद",
        "ಇಲ್ಲ", "ಬೇಡ", "ರದ್ದು",
        "नाही", "नको", "रद्द"
    ]
    
    # Check for simple confirm/cancel
    if any(pattern in user_lower for pattern in confirm_patterns) and len(user_input.split()) <= 3:
        print(f"[AI Handler] PATTERN MATCH - Confirm detected!")
        lang = order_data.get('language', 'en-US')
        responses = {
            "en-US": "Great! Your order is confirmed. Thank you!",
            "hi-IN": "बहुत बढ़िया! आपका ऑर्डर कन्फर्म हो गया है। धन्यवाद!",
            "kn-IN": "ಅದ್ಭುತ! ನಿಮ್ಮ ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ. ಧನ್ಯವಾದಗಳು!",
            "mr-IN": "छान! तुमची ऑर्डर पुष्टी झाली आहे. धन्यवाद!"
        }
        return {
            "intent": "confirm",
            "detected_language": lang.split('-')[0],
            "modifications": {},
            "response_text": responses.get(lang, responses["en-US"]),
            "continue_conversation": False
        }
    
    if any(pattern in user_lower for pattern in cancel_patterns) and len(user_input.split()) <= 3:
        print(f"[AI Handler] PATTERN MATCH - Cancel detected!")
        lang = order_data.get('language', 'en-US')
        responses = {
            "en-US": "Okay, your order has been cancelled. Goodbye!",
            "hi-IN": "ठीक है, आपका ऑर्डर रद्द कर दिया गया है। अलविदा!",
            "kn-IN": "ಸರಿ, ನಿಮ್ಮ ಆರ್ಡರ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ. ವಿದಾಯ!",
            "mr-IN": "ठीक आहे, तुमची ऑर्डर रद्द करण्यात आली आहे. निरोप!"
        }
        return {
            "intent": "cancel",
            "detected_language": lang.split('-')[0],
            "modifications": {},
            "response_text": responses.get(lang, responses["en-US"]),
            "continue_conversation": False
        }
    
    print(f"[AI Handler] No pattern match, sending to Gemini AI...")
    
    # Build conversation context
    context_str = ""
    if conversation_context:
        context_str = "\n".join([
            f"Turn {turn['turn_number']}: User: {turn['user_input']} | Bot: {turn['ai_response']}"
            for turn in conversation_context[-3:]  # Last 3 turns
        ])
    
    # Build order summary
    items_str = ", ".join([
        f"{item['quantity']}x {item['product_name']}"
        for item in order_data.get('order_items', [])
    ])
    
    # Get preferred language
    preferred_lang = order_data.get('language', 'en-US')
    
    prompt = f"""You are an AI voice assistant for ORDER CONFIRMATION calls. This is CRITICAL - you are calling to confirm a food order.

CONTEXT - THIS IS AN ORDER CONFIRMATION CALL:
The user placed an order and you are calling to confirm it. They are expecting a call about their order.

CURRENT ORDER:
- Customer: {order_data.get('customer_name')}
- Items: {items_str}
- Delivery: {order_data.get('delivery_datetime')}
- Address: {order_data.get('address')}
- Preferred Language: {preferred_lang}

CONVERSATION HISTORY:
{context_str if context_str else "This is the FIRST turn - you just asked if they want to confirm their order."}

USER JUST SAID: "{user_input}"

IMPORTANT LANGUAGE DETECTION RULES:
1. If user speaks in Hindi (हाँ, नहीं, ठीक, etc.) → detected_language = "hi"
2. If user speaks in Kannada (ಹೌದು, ಇಲ್ಲ, ಸರಿ, etc.) → detected_language = "kn"
3. If user speaks in Marathi (होय, नाही, ठीक, etc.) → detected_language = "mr"
4. If user speaks in English → detected_language = "en"
5. If preferred_language is set, BIAS towards that language

INTENT CLASSIFICATION (BE SMART):
- "confirm" = ANY positive response (yes, ok, sure, हाँ, ಹೌದು, होय, thumbs up, affirmative sounds)
- "cancel" = ANY negative response (no, cancel, नहीं, ಇಲ್ಲ, नाही)
- "modify" = User wants to change delivery time, address, or items
- "query" = User asks a question or unclear response

COMMON SPEECH-TO-TEXT ERRORS TO HANDLE:
- "how do" might mean "yes" or "okay"
- "car accident" might be misheard speech
- Short unclear phrases → Ask for clarification in their preferred language

YOUR TASK:
1. Detect the ACTUAL language (not just English because STT transcribed it)
2. Understand the intent (be generous - if it sounds positive, it's probably confirm)
3. Extract modifications if any
4. Respond in the DETECTED or PREFERRED language
5. If unclear, ask for clarification in their preferred language

RESPONSE FORMAT (JSON only):
{{
  "intent": "confirm/cancel/modify/query",
  "detected_language": "en/hi/kn/mr",
  "modifications": {{
    "delivery_time": "extracted time or null",
    "address": "extracted address or null",
    "items": "extracted item changes or null"
  }},
  "response_text": "Your response in detected/preferred language",
  "continue_conversation": true/false
}}

EXAMPLES:

User: "Yes" or "हाँ" or "ಹೌದು"
{{"intent": "confirm", "detected_language": "en/hi/kn", "modifications": {{}}, "response_text": "Great! Your order is confirmed. Thank you!", "continue_conversation": false}}

User: "how do" (unclear)
{{"intent": "query", "detected_language": "{preferred_lang.split('-')[0]}", "modifications": {{}}, "response_text": "I didn't catch that. Do you want to confirm your order? Please say yes or no.", "continue_conversation": true}}

User: "हाँ, लेकिन शाम को"
{{"intent": "modify", "detected_language": "hi", "modifications": {{"delivery_time": "evening"}}, "response_text": "ठीक है, शाम की डिलीवरी शेड्यूल कर रहा हूं। कन्फर्म करें?", "continue_conversation": true}}

User: "ನಾಳೆ ಬೆಳಿಗ್ಗೆ"
{{"intent": "modify", "detected_language": "kn", "modifications": {{"delivery_time": "tomorrow morning"}}, "response_text": "ಸರಿ, ನಾಳೆ ಬೆಳಿಗ್ಗೆ ಡೆಲಿವರಿ. ಕನ್ಫರ್ಮ್ ಮಾಡುತ್ತೀರಾ?", "continue_conversation": true}}

NOW PROCESS THE USER INPUT. Return ONLY valid JSON.
"""

    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Clean JSON from markdown
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(result_text)
        
        # Validate and fix structure
        if "intent" not in result:
            result["intent"] = "query"
        if "detected_language" not in result:
            result["detected_language"] = preferred_lang.split('-')[0]
        if "response_text" not in result:
            # Generate response in preferred language
            lang_responses = {
                "en": "I didn't understand. Do you want to confirm your order? Please say yes or no.",
                "hi": "मुझे समझ नहीं आया। क्या आप अपना ऑर्डर कन्फर्म करना चाहते हैं? कृपया हाँ या नहीं कहें।",
                "kn": "ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ನೀವು ನಿಮ್ಮ ಆರ್ಡರ್ ಕನ್ಫರ್ಮ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಾ? ದಯವಿಟ್ಟು ಹೌದು ಅಥವಾ ಇಲ್ಲ ಎಂದು ಹೇಳಿ.",
                "mr": "मला समजले नाही. तुम्हाला तुमची ऑर्डर कन्फर्म करायची आहे का? कृपया होय किंवा नाही म्हणा."
            }
            result["response_text"] = lang_responses.get(result["detected_language"], lang_responses["en"])
        if "continue_conversation" not in result:
            result["continue_conversation"] = True if result["intent"] == "query" else False
        if "modifications" not in result:
            result["modifications"] = {}
            
        return result
        
    except Exception as e:
        print(f"Gemini error: {e}")
        # Return response in preferred language
        lang = preferred_lang.split('-')[0]
        lang_responses = {
            "en": "I didn't understand. Do you want to confirm your order? Please say yes or no.",
            "hi": "मुझे समझ नहीं आया। क्या आप अपना ऑर्डर कन्फर्म करना चाहते हैं? कृपया हाँ या नहीं कहें।",
            "kn": "ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ನೀವು ನಿಮ್ಮ ಆರ್ಡರ್ ಕನ್ಫರ್ಮ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಾ? ದಯವಿಟ್ಟು ಹೌದು ಅಥವಾ ಇಲ್ಲ ಎಂದು ಹೇಳಿ.",
            "mr": "मला समजले नाही. तुम्हाला तुमची ऑर्डर कन्फर्म करायची आहे का? कृपया होय किंवा नाही म्हणा."
        }
        return {
            "intent": "query",
            "detected_language": lang,
            "modifications": {},
            "response_text": lang_responses.get(lang, lang_responses["en"]),
            "continue_conversation": True
        }

def detect_language(text: str) -> str:
    """
    Quick language detection.
    """
    prompt = f"""Detect the language of this text: "{text}"
    
Return ONLY one of: en, hi, kn, mr
No explanation, just the code."""

    try:
        response = model.generate_content(prompt)
        lang = response.text.strip().lower()
        if lang in ["en", "hi", "kn", "mr"]:
            return lang
        return "en"
    except:
        return "en"

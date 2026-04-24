import os
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Gather
from dotenv import load_dotenv
from services.tts_handler import get_voice_config
from services.audio_generator import generate_audio, get_audio_url

load_dotenv()

twilio_client = Client(
    os.getenv("TWILIO_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)

def initiate_call(to_phone: str, order_id: str, callback_url: str) -> str:
    """Initiate outbound call"""
    call = twilio_client.calls.create(
        to=to_phone,
        from_=os.getenv("TWILIO_PHONE_NUMBER"),
        url=f"{callback_url}/voice?order_id={order_id}",
        method="POST",
        status_callback=f"{callback_url}/call-status?order_id={order_id}",
        status_callback_event=["completed", "no-answer", "busy", "failed"],
        status_callback_method="POST"
    )
    return call.sid

def generate_conversational_response(message: str, language: str, callback_url: str, 
                                     order_id: str, turn_number: int = 1) -> str:
    """
    Generate TwiML for conversational AI (speech input + dynamic response)
    """
    response = VoiceResponse()
    config = get_voice_config(language)
    
    # Map language codes for Twilio STT
    stt_language_map = {
        "en-US": "en-US",
        "hi-IN": "hi-IN",
        "kn-IN": "kn-IN",
        "mr-IN": "mr-IN"
    }
    
    stt_lang = stt_language_map.get(language, "en-US")
    
    # Language-specific hints for better recognition
    hints_map = {
        "en-US": "yes,no,confirm,cancel,tomorrow,evening,morning,address,change,okay",
        "hi-IN": "हाँ,नहीं,ठीक,कन्फर्म,रद्द,कल,शाम,सुबह,पता,बदलो",
        "kn-IN": "ಹೌದು,ಇಲ್ಲ,ಸರಿ,ಕನ್ಫರ್ಮ್,ರದ್ದು,ನಾಳೆ,ಸಂಜೆ,ಬೆಳಿಗ್ಗೆ",
        "mr-IN": "होय,नाही,ठीक,कन्फर्म,रद्द,उद्या,संध्याकाळ,सकाळ"
    }
    
    # Use Gather with speech input
    gather = Gather(
        input='speech dtmf',  # Accept both speech and keypad
        action=f"{callback_url}/process-speech?order_id={order_id}&turn={turn_number}",
        method="POST",
        timeout=5,
        speech_timeout="auto",
        language=stt_lang,  # Use correct language for STT
        hints=hints_map.get(language, hints_map["en-US"]),
        profanity_filter=False  # Don't filter, we need all words
    )
    
    # Speak the message
    if config.get("use_gtts"):
        audio_file = generate_audio(message, language, f"turn_{order_id}_{turn_number}")
        if audio_file:
            audio_url = get_audio_url(f"turn_{order_id}_{turn_number}", callback_url)
            gather.play(audio_url)
        else:
            gather.say(message, voice="Polly.Aditi", language="hi-IN")
    else:
        gather.say(message, voice=config["voice"], language=config["language"])
    
    response.append(gather)
    
    # Fallback if no input
    fallback_messages = {
        "en-US": "I didn't hear anything. Goodbye.",
        "hi-IN": "मुझे कुछ सुनाई नहीं दिया। अलविदा।",
        "kn-IN": "ನನಗೆ ಏನೂ ಕೇಳಿಸಲಿಲ್ಲ. ವಿದಾಯ.",
        "mr-IN": "मला काहीच ऐकू आले नाही. निरोप."
    }
    response.say(fallback_messages.get(language, fallback_messages["en-US"]), 
                 voice="Polly.Joanna", language="en-US")
    
    return str(response)

def generate_initial_greeting(order_data: dict, callback_url: str) -> str:
    """
    Generate initial conversational greeting (not IVR style)
    """
    language = order_data.get("language", "en-US")
    name = order_data.get("customer_name", "").split()[0]  # First name only
    
    # Build items summary
    items = order_data.get("order_items", [])
    if len(items) == 1:
        items_str = f"{items[0]['quantity']} {items[0]['product_name']}"
    elif len(items) == 2:
        items_str = f"{items[0]['product_name']} and {items[1]['product_name']}"
    else:
        items_str = f"{len(items)} items"
    
    # Natural greetings per language
    greetings = {
        "en-US": f"Hi {name}, this is about your order of {items_str}. Do you want to confirm this order?",
        "hi-IN": f"नमस्ते {name}, यह आपके {items_str} के ऑर्डर के बारे में है। क्या आप इस ऑर्डर की पुष्टि करना चाहते हैं?",
        "kn-IN": f"ನಮಸ್ಕಾರ {name}, ಇದು ನಿಮ್ಮ {items_str} ಆರ್ಡರ್ ಬಗ್ಗೆ. ನೀವು ಈ ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲು ಬಯಸುತ್ತೀರಾ?",
        "mr-IN": f"नमस्कार {name}, हे तुमच्या {items_str} च्या ऑर्डरबद्दल आहे. तुम्हाला या ऑर्डरची पुष्टी करायची आहे का?"
    }
    
    message = greetings.get(language, greetings["en-US"])
    
    return generate_conversational_response(
        message=message,
        language=language,
        callback_url=callback_url,
        order_id=order_data["id"],
        turn_number=1
    )

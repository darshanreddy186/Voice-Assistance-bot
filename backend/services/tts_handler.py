# Using gTTS for Kannada and Marathi, Twilio Polly for English and Hindi

LANGUAGE_CONFIG = {
    "en-US": {
        "voice": "Polly.Joanna",
        "language": "en-US",
        "use_gtts": False,
    },
    "hi-IN": {
        "voice": "Polly.Aditi",
        "language": "hi-IN",
        "use_gtts": False,
    },
    "kn-IN": {
        "voice": None,
        "language": "kn",
        "use_gtts": True,  # Use gTTS for Kannada
    },
    "mr-IN": {
        "voice": None,
        "language": "mr",
        "use_gtts": True,  # Use gTTS for Marathi
    },
}

MESSAGES = {
    "en-US": "Hello {name}, your order is {order}. Press 1 to confirm, or press 2 to cancel.",
    "hi-IN": "नमस्ते {name}, आपका ऑर्डर है {order}. पुष्टि के लिए 1 दबाएं, रद्द करने के लिए 2 दबाएं।",
    "kn-IN": "ನಮಸ್ಕಾರ {name}, ನಿಮ್ಮ ಆರ್ಡರ್ ಇದು {order}. ದೃಢೀಕರಿಸಲು ಒಂದು ಒತ್ತಿರಿ, ರದ್ದುಗೊಳಿಸಲು ಎರಡು ಒತ್ತಿರಿ.",
    "mr-IN": "नमस्कार {name}, तुमची ऑर्डर आहे {order}. पुष्टी करण्यासाठी एक दाबा, रद्द करण्यासाठी दोन दाबा.",
}

def get_message(language: str, name: str, order: str) -> str:
    template = MESSAGES.get(language, MESSAGES["en-US"])
    return template.format(name=name, order=order)

def get_voice_config(language: str) -> dict:
    return LANGUAGE_CONFIG.get(language, LANGUAGE_CONFIG["en-US"])


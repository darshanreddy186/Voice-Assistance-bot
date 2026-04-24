import os
from gtts import gTTS
from pathlib import Path

# Create audio directory
AUDIO_DIR = Path("audio_files")
AUDIO_DIR.mkdir(exist_ok=True)

LANGUAGE_CODES = {
    "en-US": "en",
    "hi-IN": "hi", 
    "kn-IN": "kn",  # Kannada
    "mr-IN": "mr",  # Marathi
}

def generate_audio(text: str, language: str, filename: str) -> str:
    """
    Generate audio file using gTTS and return the file path.
    """
    lang_code = LANGUAGE_CODES.get(language, "en")
    
    try:
        tts = gTTS(text=text, lang=lang_code, slow=False)
        filepath = AUDIO_DIR / f"{filename}.mp3"
        tts.save(str(filepath))
        return str(filepath)
    except Exception as e:
        print(f"Error generating audio: {e}")
        return None

def get_audio_url(filename: str, base_url: str) -> str:
    """
    Return the public URL for the audio file.
    """
    return f"{base_url}/audio/{filename}.mp3"

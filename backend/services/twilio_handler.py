import os
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Gather
from dotenv import load_dotenv
from services.tts_handler import get_message, get_voice_config
from services.audio_generator import generate_audio, get_audio_url

load_dotenv()

twilio_client = Client(
    os.getenv("TWILIO_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)

def initiate_call(to_phone: str, order_id: str, callback_url: str) -> str:
    call = twilio_client.calls.create(
        to=to_phone,
        from_=os.getenv("TWILIO_PHONE_NUMBER"),
        url=f"{callback_url}/voice?order_id={order_id}",
        method="POST"
    )
    return call.sid

def generate_voice_response(customer_name: str, order_details: str, language: str, callback_url: str, order_id: str) -> str:
    response = VoiceResponse()
    config = get_voice_config(language)
    message = get_message(language, customer_name, order_details)

    gather = Gather(
        num_digits=1,
        action=f"{callback_url}/process-response?order_id={order_id}",
        method="POST",
        timeout=10
    )
    
    # Use gTTS for Kannada and Marathi, Polly for English and Hindi
    if config.get("use_gtts"):
        # Generate audio file
        audio_file = generate_audio(message, language, f"order_{order_id}")
        if audio_file:
            audio_url = get_audio_url(f"order_{order_id}", callback_url)
            gather.play(audio_url)
        else:
            # Fallback to Say if audio generation fails
            gather.say(message, voice="Polly.Aditi", language="hi-IN")
    else:
        # Use Twilio's built-in Say
        gather.say(message, voice=config["voice"], language=config["language"])
    
    response.append(gather)

    # Fallback if no input
    response.say("We did not receive your input. Please call back. Goodbye.", voice="Polly.Joanna", language="en-US")
    return str(response)

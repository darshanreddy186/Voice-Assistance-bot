import os
from fastapi import APIRouter, Request, Form, HTTPException
from fastapi.responses import Response, FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path

from services.supabase_handler import create_order, get_all_orders, get_order_by_id, update_order_status
from services.twilio_handler import initiate_call, generate_voice_response
from services.ai_handler import classify_intent

load_dotenv()

router = APIRouter()

CALLBACK_URL = os.getenv("CALLBACK_URL", "https://your-ngrok-url.ngrok.io")

class OrderRequest(BaseModel):
    customer_name: str
    phone: str
    order_details: str
    language: str = "en-US"

class CallRequest(BaseModel):
    order_id: str

@router.post("/create-order")
def create_order_endpoint(order: OrderRequest):
    try:
        result = create_order(
            customer_name=order.customer_name,
            phone=order.phone,
            order_details=order.order_details,
            language=order.language
        )
        return {"success": True, "order": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/initiate-call")
def initiate_call_endpoint(req: CallRequest):
    order = get_order_by_id(req.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    try:
        call_sid = initiate_call(
            to_phone=order["phone"],
            order_id=order["id"],
            callback_url=CALLBACK_URL
        )
        return {"success": True, "call_sid": call_sid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/voice")
async def voice_webhook(request: Request, order_id: str = None):
    try:
        print(f"\n=== Voice Webhook Called ===")
        print(f"Order ID: {order_id}")
        print(f"Request URL: {request.url}")
        
        if not order_id:
            print("ERROR: No order_id provided")
            return Response(content="<Response><Say>Order ID missing.</Say></Response>", media_type="application/xml")
        
        order = get_order_by_id(order_id)
        if not order:
            print(f"ERROR: Order {order_id} not found in database")
            return Response(content="<Response><Say>Order not found.</Say></Response>", media_type="application/xml")

        print(f"Language: {order['language']}")
        print(f"Customer: {order['customer_name']}")
        print(f"Order: {order['order_details']}")

        twiml = generate_voice_response(
            customer_name=order["customer_name"],
            order_details=order["order_details"],
            language=order["language"],
            callback_url=CALLBACK_URL,
            order_id=order_id
        )
        
        print(f"TwiML Generated:\n{twiml}\n")
        
        return Response(content=twiml, media_type="application/xml")
    
    except Exception as e:
        print(f"ERROR in voice_webhook: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(content="<Response><Say>An error occurred. Please try again.</Say></Response>", media_type="application/xml")

@router.post("/process-response")
async def process_response(request: Request, order_id: str = None):
    try:
        form_data = await request.form()
        
        print(f"\n=== Response Received ===")
        print(f"Order ID: {order_id}")
        print(f"Form data: {dict(form_data)}")
        
        if not order_id:
            print("ERROR: No order_id in process-response")
            return Response(content="<Response><Say>Order ID missing.</Say></Response>", media_type="application/xml")
        
        # Keypad input (primary fallback)
        digits = form_data.get("Digits", "")
        speech_result = form_data.get("SpeechResult", "")
        
        intent = "UNCLEAR"
        
        if digits == "1":
            intent = "CONFIRM"
        elif digits == "2":
            intent = "CANCEL"
        elif speech_result:
            intent = classify_intent(speech_result)
        
        print(f"Intent classified as: {intent}")
        
        # Get order to determine language for response
        order = get_order_by_id(order_id)
        language = order.get("language", "en-US") if order else "en-US"
        
        # Response messages in all languages (natural sentence structure)
        responses = {
            "CONFIRM": {
                "en-US": "Thank you! Your order has been confirmed. Goodbye.",
                "hi-IN": "धन्यवाद! आपका ऑर्डर कन्फर्म हो गया है। अलविदा।",
                "kn-IN": "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ. ವಿದಾಯ.",
                "mr-IN": "धन्यवाद! तुमची ऑर्डर पुष्टी झाली आहे. निरोप."
            },
            "CANCEL": {
                "en-US": "Your order has been cancelled. Goodbye.",
                "hi-IN": "आपका ऑर्डर रद्द कर दिया गया है। अलविदा।",
                "kn-IN": "ನಿಮ್ಮ ಆರ್ಡರ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ. ವಿದಾಯ.",
                "mr-IN": "तुमची ऑर्डर रद्द करण्यात आली आहे. निरोप."
            },
            "UNCLEAR": {
                "en-US": "We could not understand your response. Please call back. Goodbye.",
                "hi-IN": "हम आपका जवाब नहीं समझ पाए। कृपया वापस कॉल करें। अलविदा।",
                "kn-IN": "ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಕರೆ ಮಾಡಿ. ವಿದಾಯ.",
                "mr-IN": "आम्हाला तुमचा प्रतिसाद समजला नाही. कृपया परत कॉल करा. निरोप."
            }
        }
        
        if intent == "CONFIRM":
            update_order_status(order_id, "confirmed")
            reply = responses["CONFIRM"].get(language, responses["CONFIRM"]["en-US"])
        elif intent == "CANCEL":
            update_order_status(order_id, "cancelled")
            reply = responses["CANCEL"].get(language, responses["CANCEL"]["en-US"])
        else:
            reply = responses["UNCLEAR"].get(language, responses["UNCLEAR"]["en-US"])
        
        twiml = f"<Response><Say>{reply}</Say></Response>"
        print(f"Response TwiML:\n{twiml}\n")
        
        return Response(content=twiml, media_type="application/xml")
    
    except Exception as e:
        print(f"ERROR in process_response: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(content="<Response><Say>An error occurred processing your response.</Say></Response>", media_type="application/xml")

@router.get("/orders")
def get_orders():
    try:
        orders = get_all_orders()
        return {"orders": orders}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/audio/{filename}")
def serve_audio(filename: str):
    """
    Serve generated audio files for Twilio to play.
    """
    audio_path = Path("audio_files") / filename
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(audio_path, media_type="audio/mpeg")
